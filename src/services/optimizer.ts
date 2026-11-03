import { Pokemon, Recipe, SnorlaxConfig, OptimizedTeamResult, MealPlan, DishType } from '../types/pokemon';
import { INGREDIENTS, RECIPES, DISH_LEVEL_BONUS, getBerryVigor, POT_SIZES, normalizeBerryName } from '../data/gameData';
import { getPokemonCanonicalSkill, isSpecialPokemon, normalizeMainSkillName } from './pokeApiService';
import { getSpeciesMasterData } from '../data/speciesMaster';

export const MIXED_DISHES: Record<DishType, Recipe> = {
  curry: {
    id: 'curry-mixed',
    name: 'Curri Mixto',
    type: 'curry',
    baseVigor: 0,
    ingredients: {},
    description: 'Plato básico con ingredientes variados al no completar una receta específica.'
  },
  salad: {
    id: 'salad-mixed',
    name: 'Ensalada Mixta',
    type: 'salad',
    baseVigor: 0,
    ingredients: {},
    description: 'Plato básico con ingredientes variados al no completar una receta específica.'
  },
  dessert: {
    id: 'dessert-mixed',
    name: 'Zumo Mixto',
    type: 'dessert',
    baseVigor: 0,
    ingredients: {},
    description: 'Plato básico con ingredientes variados al no completar una receta específica.'
  }
};

// Datamined base ingredient drop rates from Pokemon Sleep (RaenonX / Serebii)
const SPECIES_BASE_ING_RATES: Record<string, number> = {
  gengar: 0.161,
  haunter: 0.156,
  gastly: 0.142,
  dragonite: 0.262,
  dragonair: 0.241,
  dratini: 0.223,
  tyranitar: 0.258,
  pupitar: 0.239,
  larvitar: 0.218,
  venusaur: 0.263,
  ivysaur: 0.245,
  bulbasaur: 0.228,
  blastoise: 0.274,
  wartortle: 0.251,
  squirtle: 0.232,
  charizard: 0.252,
  charmeleon: 0.234,
  charmander: 0.215,
  dugtrio: 0.273,
  diglett: 0.241,
  victreebel: 0.255,
  weepinbell: 0.236,
  bellsprout: 0.217,
  golem: 0.282,
  graveler: 0.254,
  geodude: 0.226,
  ditto: 0.191,
  pinsir: 0.218,
  heracross: 0.185,
  absol: 0.182,
  kangaskhan: 0.215
};

interface PokemonProduction {
  pokemon: Pokemon;
  effectiveFrequency: number;
  helpsPerDay: number;
  dailyBerryVigor: number;
  dailyIngredients: Record<string, number>;
  dailySkillVigor: number;
  skillTriggersPerDay: number;
  effectiveSkillLevel: number;
  normalizedSkillName: string;
  isHealer: boolean;
}

// Helper unificado para detectar sanadores de equipo según WikiDex / Serebii
export function isTeamHealer(pokemon: Pokemon): boolean {
  const name = pokemon.name.toLowerCase();
  const skill = normalizeMainSkillName(pokemon.mainSkillName || getPokemonCanonicalSkill(pokemon.name));
  return (
    skill.includes('Energía para todos') ||
    skill.includes('Zumo de Baya') ||
    skill.includes('Plegaria Lunar') ||
    [
      'jigglypuff', 'wigglytuff', 'igglybuff',
      'pawmi', 'pawmo', 'pawmot',
      'ralts', 'kirlia', 'gardevoir',
      'sylveon', 'cresselia', 'shuckle',
      'happiny', 'chansey', 'blissey',
      'turtwig', 'grotle', 'torterra'
    ].some(h => name.includes(h))
  );
}

// Detects if the official Halloween 2026: Doble Dulce event is active
export function isHalloweenEventActive(config?: SnorlaxConfig): boolean {
  if (config && typeof config.halloweenEventActive === 'boolean') {
    return config.halloweenEventActive;
  }
  // Auto-detect based on current real-world date during the event week: Oct 26 04:00 to Nov 2 03:59 (2026)
  const now = new Date();
  const start = new Date('2026-10-26T04:00:00');
  const end = new Date('2026-11-02T03:59:59');
  const inDateRange = now >= start && now <= end;
  if (!config) return inDateRange;
  return inDateRange && (!config.island || config.island === 'greengrass');
}

// Check if a Pokemon is Ghost type (benefits from Halloween 2026 buffs)
export function isGhostPokemon(pokemon: Pokemon): boolean {
  if (pokemon.berry && pokemon.berry.trim() === 'Baya Oram') return true;
  const master = getSpeciesMasterData(pokemon.name);
  if (master && master.type && master.type.toLowerCase() === 'ghost') return true;
  const ghostNames = [
    'gastly', 'haunter', 'gengar',
    'shuppet', 'banette',
    'drifloon', 'drifblim',
    'misdreavus', 'mismagius',
    'pumpkaboo', 'gourgeist',
    'mimikyu', 'skeledirge'
  ];
  const lowerName = pokemon.name.toLowerCase();
  return ghostNames.some(g => lowerName.includes(g));
}

// Determine actual skill level from explicit property, notes, evolution stage and subskills
export function getPokemonSkillLevel(pokemon: Pokemon): number {
  let baseLevel = 1;

  // 1. Si existe nota explícita, tomamos nota primero
  const noteMatch = pokemon.notes?.match(/Nv\.\s*(\d+)/i);
  if (noteMatch) {
    const parsed = parseInt(noteMatch[1], 10);
    if (parsed >= 1 && parsed <= 7) {
      baseLevel = parsed;
    }
  } else if (typeof pokemon.mainSkillLevel === 'number' && pokemon.mainSkillLevel >= 1) {
    baseLevel = pokemon.mainSkillLevel;
  } else {
    // Si no está especificado, deducimos el nivel base por su evolución oficial de Pokémon Sleep (+1 nivel por evolución)
    const master = getSpeciesMasterData(pokemon.name);
    if (master && typeof master.evolutionCount === 'number') {
      baseLevel = 1 + master.evolutionCount;
    } else {
      const name = pokemon.name.toLowerCase();
      if (['gengar', 'blastoise', 'charizard', 'venusaur', 'raichu', 'typhlosion', 'feraligatr', 'meganium', 'ampharos', 'tyranitar', 'walrein', 'gardevoir', 'gallade', 'magnezone', 'togekiss', 'sceptile', 'blaziken', 'swampert', 'empoleon', 'torterra', 'infernape', 'luxray', 'aggron', 'flygon', 'vikavolt', 'bewear', 'meowscarada', 'skeledirge', 'quaquaval'].some(s => name.includes(s))) {
        baseLevel = 3;
      } else if (['haunter', 'espeon', 'flareon', 'vaporeon', 'jolteon', 'umbreon', 'leafeon', 'glaceon', 'sylveon', 'flaaffy', 'quilava', 'croconaw', 'bayleef', 'ivysaur', 'wartortle', 'charmeleon', 'graveler', 'dugtrio', 'sealeo', 'kirlia', 'pupitar', 'togetic', 'grovyle', 'combusken', 'marshtomp', 'prinplup', 'grotle', 'monferno', 'luxio', 'lairon', 'vibrava', 'charjabug', 'floragato', 'crocalor', 'quaxwell'].some(s => name.includes(s))) {
        baseLevel = 2;
      }
    }
  }

  // 2. Si NO venía ya calculado en las notas, sumamos las subskills activas (Nivel habilidad S = +1, Nivel habilidad M = +2)
  if (!noteMatch) {
    for (const sub of pokemon.subskills) {
      if (!sub.enabled) continue;
      if (sub.name === 'Nivel habilidad S') baseLevel += 1;
      if (sub.name === 'Nivel habilidad M' || sub.name === 'Nivel habilidad L') baseLevel += 2;
    }
  }

  return Math.min(7, Math.max(1, baseLevel));
}

export function resolvePokemonMainSkill(pokemon: Pokemon): string {
  const cleanName = pokemon.name.toLowerCase().trim();
  const canonical = getPokemonCanonicalSkill(pokemon.name);
  let mainSkill = normalizeMainSkillName(pokemon.mainSkillName || canonical);
  const isLegendaryBeast = ['raikou', 'entei', 'suicune'].some(b => cleanName.includes(b));

  if (cleanName === 'eevee' && mainSkill !== 'Imán ingredientes S') {
    mainSkill = 'Imán ingredientes S';
  } else if (cleanName === 'ditto' && (mainSkill === 'Carga vigor S' || mainSkill.toLowerCase().includes('copy') || mainSkill.toLowerCase().includes('transform'))) {
    mainSkill = 'Transformación (Copia habilidades)';
  } else if ((cleanName.includes('misdreavus') || cleanName.includes('mismagius')) && mainSkill !== 'Llama Embrujada (Cocinitas con sustancia S)') {
    mainSkill = 'Llama Embrujada (Cocinitas con sustancia S)';
  } else if (mainSkill.includes('Impulso de ayuda') && !isLegendaryBeast) {
    mainSkill = canonical;
  }

  return mainSkill;
}

// Official datamined cooking skill bonuses per trigger (RaenonX / Serebii)
export function getSkillCookingEffectPerTrigger(mainSkill: string, skillLevel: number): {
  potBoost: number;
  critBoostPercent: number;
  randomIngredients: number;
} {
  const lvl = Math.min(7, Math.max(1, skillLevel));

  // Llama Embrujada (Cocinitas con sustancia S) — Misdreavus, Mismagius
  // Nv.1-7: +7, +10, +12, +17, +22, +27, +31 puchero | +1%, +2%, +2%, +3%, +3%, +4%, +5% plato riquísimo
  if (mainSkill.includes('Llama Embrujada') || mainSkill.includes('con sustancia')) {
    const potTable = [0, 7, 10, 12, 17, 22, 27, 31];
    const critTable = [0, 1, 2, 2, 3, 3, 4, 5];
    return {
      potBoost: potTable[lvl] || 10,
      critBoostPercent: critTable[lvl] || 2,
      randomIngredients: 0
    };
  }

  // Receta sustanciosa S / Menos (Receta sustanciosa S) — Magnezone, Flareon, Glaceon, Meowscarada, Luxray, Minun, Toxtricity Low Key
  if (mainSkill.includes('Receta sustanciosa') || mainSkill.includes('Menos (Receta')) {
    const potTable = [0, 7, 10, 14, 18, 22, 27, 31];
    return {
      potBoost: potTable[lvl] || 10,
      critBoostPercent: 0,
      randomIngredients: 0
    };
  }

  // Cocinitas S (Tasty Chance S) — Dedenne, Swampert, Weavile, Cramorant
  if (mainSkill.includes('Cocinitas S')) {
    const critTable = [0, 4, 5, 6, 7, 8, 10, 12];
    return {
      potBoost: 0,
      critBoostPercent: critTable[lvl] || 5,
      randomIngredients: 0
    };
  }

  // Corpulencia (Asistencia culinaria S / Bulk Up) — Heracross (rework v3.3.0)
  // Inyecta 6, 8, 11, 14, 17, 21, 24 ingredientes aleatorios + 1% a 5% de plato riquísimo
  if (mainSkill.includes('Corpulencia') || mainSkill.includes('Asistencia culinaria')) {
    const ingTable = [0, 6, 8, 11, 14, 17, 21, 24];
    const critTable = [0, 1, 2, 2, 3, 3, 4, 5];
    return {
      potBoost: 0,
      critBoostPercent: critTable[lvl] || 2,
      randomIngredients: ingTable[lvl] || 8
    };
  }

  return { potBoost: 0, critBoostPercent: 0, randomIngredients: 0 };
}

// Official Serebii / RaenonX 2D table for Helper Boost (Raikou, Entei, Suicune)
// Rows = unique matching-type species on the team (1..5), Cols = Skill Level (1..7)
const HELPER_BOOST_MATRIX: Record<number, number[]> = {
  1: [0, 2, 3, 3, 4, 4, 5, 6],
  2: [0, 2, 3, 3, 4, 5, 6, 7],
  3: [0, 3, 4, 5, 6, 7, 8, 9],
  4: [0, 4, 5, 6, 7, 8, 9, 10],
  5: [0, 6, 7, 8, 9, 10, 11, 12]
};

export function getHelperBoostHelpsPerMember(
  pokemon: Pokemon,
  skillLevel: number,
  team?: Pokemon[],
  config?: SnorlaxConfig
): number {
  const lvl = Math.min(7, Math.max(1, skillLevel));
  const cleanName = pokemon.name.toLowerCase();
  const mainSkill = resolvePokemonMainSkill(pokemon);

  let targetBerry = '';
  if (cleanName.includes('raikou') || mainSkill.includes('Eléctrico')) targetBerry = 'Baya Uvav';
  else if (cleanName.includes('entei') || mainSkill.includes('Fuego')) targetBerry = 'Baya Zanama';
  else if (cleanName.includes('suicune') || mainSkill.includes('Agua')) targetBerry = 'Baya Aranja';

  let uniqueMatchingSpecies = 1;
  if (team && team.length > 0 && targetBerry) {
    const uniqueIds = new Set<string>();
    for (const member of team) {
      if (normalizeBerryName(member.berry) === targetBerry) {
        const master = getSpeciesMasterData(member.name);
        uniqueIds.add(master ? master.id : member.name.toLowerCase().trim());
      }
    }
    uniqueMatchingSpecies = Math.min(5, Math.max(1, uniqueIds.size));
  } else if (config && targetBerry && config.favoriteBerries.some(fav => normalizeBerryName(fav) === targetBerry)) {
    // Solo heuristic when favored berry matches: assume moderate 2-species synergy until Beam Search tests actual teams
    uniqueMatchingSpecies = 2;
  }

  const row = HELPER_BOOST_MATRIX[uniqueMatchingSpecies] || HELPER_BOOST_MATRIX[1];
  return row[lvl] || 3;
}

// Calculate realistic vigor per trigger according to official Pokémon Sleep datamined tables
export function getSkillVigorPerTrigger(
  pokemon: Pokemon,
  extraSkillLevels = 0,
  teamContext?: { team?: Pokemon[]; config?: SnorlaxConfig }
): number {
  const baseLevel = getPokemonSkillLevel(pokemon);
  const skillLevel = Math.min(7, baseLevel + extraSkillLevels);
  const cleanName = pokemon.name.toLowerCase().trim();
  const mainSkill = resolvePokemonMainSkill(pokemon);
  const isLegendaryBeast = ['raikou', 'entei', 'suicune'].some(b => cleanName.includes(b));

  if (mainSkill.includes('Carga vigor M')) {
    // Official Serebii Lv.1-7: 880, 1251, 1726, 2383, 3290, 4546, 6858
    const table = [0, 880, 1251, 1726, 2383, 3290, 4546, 6858];
    return table[skillLevel] || 1726;
  }

  if (mainSkill.includes('Reserva')) {
    // Stockpile / Spit Up (Drifloon, Drifblim) — RaenonX expected vigor per trigger (~1.44x Fixed Charge Strength S)
    const table = [0, 575, 820, 1130, 1560, 2155, 2975, 4320];
    return table[skillLevel] || 1130;
  }

  if (mainSkill.includes('Carga vigor S')) {
    // Variable Charge Strength S (200-800 at Lv.1 -> average 1.25x Fixed) vs Fixed (400 at Lv.1)
    const isVariableUser = [
      'psyduck', 'golduck', 'gastly', 'haunter', 'gengar',
      'mankey', 'primeape', 'chikorita', 'bayleef', 'meganium',
      'croagunk', 'toxicroak'
    ].some(sp => cleanName.includes(sp));

    if (isVariableUser) {
      const varTable = [0, 500, 711, 981, 1354, 1870, 2583, 4015];
      return varTable[skillLevel] || 981;
    }
    const fixedTable = [0, 400, 569, 785, 1083, 1496, 2066, 3212];
    return fixedTable[skillLevel] || 785;
  }

  if (mainSkill.includes('Imán ingredientes S') || mainSkill.includes('Más (Imán') || mainSkill.includes('Presente')) {
    // Oficial Sleep: 6, 8, 11, 14, 17, 21, 24 ingredientes aleatorios
    const ingCounts = [0, 6, 8, 11, 14, 17, 21, 24];
    let baseIngs = ingCounts[skillLevel] || 8;
    // Sinergia oficial Más / Menos: si hay otro compañero con Más o Menos en el equipo, suma ingredientes extra
    if (mainSkill.includes('Más (Imán') && teamContext?.team) {
      const plusMinusCount = teamContext.team.filter(m => {
        const sk = resolvePokemonMainSkill(m);
        return sk.includes('Más (Imán') || sk.includes('Menos (Receta');
      }).length;
      if (plusMinusCount >= 2) {
        const bonusPlus = [0, 5, 6, 7, 8, 9, 10, 12];
        baseIngs += bonusPlus[skillLevel] || 6;
      }
    }
    return baseIngs * 115;
  }

  if (mainSkill.includes('Ingrediente aleatorio S') || mainSkill.includes('Afortunado') || mainSkill.includes('Corte Fuerte')) {
    const ingCounts = [0, 6, 8, 11, 14, 17, 21, 24];
    return (ingCounts[skillLevel] || 8) * 122;
  }

  if (mainSkill.includes('Llama Embrujada') || mainSkill.includes('con sustancia')) {
    const { potBoost, critBoostPercent } = getSkillCookingEffectPerTrigger(mainSkill, skillLevel);
    return potBoost * 95 + critBoostPercent * 210;
  }

  if (mainSkill.includes('Corpulencia') || mainSkill.includes('Asistencia culinaria')) {
    const { randomIngredients, critBoostPercent } = getSkillCookingEffectPerTrigger(mainSkill, skillLevel);
    return randomIngredients * 115 + critBoostPercent * 210;
  }

  if (mainSkill.includes('Receta sustanciosa') || mainSkill.includes('Menos (Receta')) {
    const { potBoost } = getSkillCookingEffectPerTrigger(mainSkill, skillLevel);
    return potBoost * 95;
  }

  if (mainSkill.includes('Cocinitas S')) {
    const { critBoostPercent } = getSkillCookingEffectPerTrigger(mainSkill, skillLevel);
    return critBoostPercent * 210;
  }

  if (mainSkill.includes('Metrónomo') || mainSkill.includes('Transformación') || mainSkill.includes('Mimético') || mainSkill.includes('Copia habilidades')) {
    const table = [0, 800, 1200, 1750, 2450, 3400, 4650, 6200];
    return table[skillLevel] || 2450;
  }

  if (mainSkill.includes('Mejora de ayuda') || (mainSkill.includes('Impulso de ayuda') && isLegendaryBeast)) {
    // Bestias legendarias: usa la matriz oficial 1..5 especies del mismo tipo (evita inflar en equipos mixtos)
    const helpsPerMember = getHelperBoostHelpsPerMember(pokemon, skillLevel, teamContext?.team, teamContext?.config);
    return helpsPerMember * 5 * 165;
  }

  if (mainSkill.includes('Superútil S')) {
    // Oficial Serebii tras buffs: 6, 7, 8, 9, 10, 11, 12 recolecciones a 1 miembro aleatorio (~165 vigor base realista en solo)
    const helps = [0, 6, 7, 8, 9, 10, 11, 12];
    return (helps[skillLevel] || 7) * 165;
  }

  if (mainSkill.includes('Bayamanía') || mainSkill.includes('Cometa Draco') || mainSkill.includes('Disfraz')) {
    const table = [0, 850, 1250, 1800, 2500, 3400, 4550, 6000];
    return table[skillLevel] || 1800;
  }

  if (mainSkill.includes('Ánimo enérgico') || mainSkill.includes('Pulso Cura') || mainSkill.includes('Moflete Estático') || mainSkill.includes('Luz Lunar')) {
    const energy = [0, 14, 19, 24, 31, 39, 48, 55];
    return (energy[skillLevel] || 19) * 30;
  }

  if (mainSkill.includes('Carga energía') || mainSkill.includes('Autocuración')) {
    const energy = [0, 12, 16, 21, 26, 33, 43, 50];
    return (energy[skillLevel] || 16) * 22;
  }

  if (mainSkill.includes('Energía para todos') || mainSkill.includes('Zumo de Baya') || mainSkill.includes('Plegaria Lunar')) {
    const table = [0, 350, 500, 700, 950, 1250, 1600, 2000];
    return table[skillLevel] || 500;
  }

  if (mainSkill.includes('Onda Mental')) {
    const table = [0, 950, 1380, 1920, 2680, 3700, 5100, 6800];
    return table[skillLevel] || 1920;
  }

  if (mainSkill.includes('Mal Sueño')) {
    const table = [0, 750, 1100, 1550, 2150, 3000, 4100, 5500];
    return table[skillLevel] || 1550;
  }

  if (mainSkill.includes('Imán fragmentos') || mainSkill.includes('Esfera Aural')) {
    const table = [0, 240, 340, 480, 670, 920, 1260, 1800];
    return table[skillLevel] || 480;
  }

  return 300 + skillLevel * 150;
}

// Calculate realistic team energy speed multiplier based on ACTUAL healing output
export function calculateTeamEnergyFactor(team: Pokemon[], config?: SnorlaxConfig): {
  teamEnergyFactor: number;
  totalDailyHealedEnergy: number;
  hasEffectiveHealer: boolean;
} {
  const BASE_ENERGY_FACTOR = 1.42;
  const MAX_HEALER_BONUS = 0.68; // 1.42 + 0.68 = 2.10 max

  const healers = team.filter(p => isTeamHealer(p));

  if (healers.length === 0) {
    return { teamEnergyFactor: BASE_ENERGY_FACTOR, totalDailyHealedEnergy: 0, hasEffectiveHealer: false };
  }

  const isEvent = isHalloweenEventActive(config);
  let totalDailyHealedEnergy = 0;

  for (const healer of healers) {
    const isGhostHealer = isEvent && isGhostPokemon(healer);
    const name = healer.name.toLowerCase();
    const master = getSpeciesMasterData(healer.name);
    let baseTriggerRate = master ? (master.skillRate / 100) : 0.035;
    if (!master) {
      if (name.includes('gardevoir') || name.includes('wigglytuff')) baseTriggerRate = 0.045;
      else if (name.includes('sylveon')) baseTriggerRate = 0.040;
      else if (name.includes('jigglypuff') || name.includes('kirlia') || name.includes('pawmo')) baseTriggerRate = 0.028;
      else if (name.includes('igglybuff') || name.includes('pawmi') || name.includes('ralts')) baseTriggerRate = 0.018;
    }

    let triggerSubskillBonus = 0;
    for (const sub of healer.subskills) {
      if (!sub.enabled) continue;
      if (sub.name === 'Activación S') triggerSubskillBonus += 0.18;
      if (sub.name === 'Activación M') triggerSubskillBonus += 0.36;
    }
    const triggerMod = (1 + triggerSubskillBonus) * (healer.natureObj?.skillMod || 1.0) * (isGhostHealer ? 1.25 : 1.0);

    const effectiveTriggerRate = baseTriggerRate * triggerMod;

    // Note: healer.frequencySeconds already includes individual level, nature, and individual subskills
    const healerFreq = (healer.frequencySeconds && healer.frequencySeconds > 0)
      ? healer.frequencySeconds
      : (master ? master.baseFrequency : 3000);
    const approxHelpsPerDay = Math.floor(86400 / (healerFreq / BASE_ENERGY_FACTOR));

    const dailyTriggers = approxHelpsPerDay * effectiveTriggerRate;

    const skillLevel = Math.min(7, getPokemonSkillLevel(healer) + (isGhostHealer ? 3 : 0));
    const healTable = [0, 5, 7, 9, 11, 15, 18, 22];
    const energyPerHeal = healTable[skillLevel] || 5;

    totalDailyHealedEnergy += dailyTriggers * energyPerHeal;
  }

  // In Pokemon Sleep, ~70 energy/day is required to maintain the team at >80% energy (2.10x)
  const healerEfficiency = Math.min(1.0, totalDailyHealedEnergy / 70);
  const teamEnergyFactor = BASE_ENERGY_FACTOR + MAX_HEALER_BONUS * healerEfficiency;
  const hasEffectiveHealer = totalDailyHealedEnergy >= 25;

  return { teamEnergyFactor, totalDailyHealedEnergy, hasEffectiveHealer };
}

// Calculate effective pot capacity including Sunday (2x) and Good Camp Ticket (+50% rounded up)
export function getEffectivePotCapacity(config: SnorlaxConfig): number {
  let capacity = config.isSunday ? config.potSize * 2 : config.potSize;
  if (config.goodCampTicket) {
    capacity += Math.ceil(capacity * 0.5);
  }
  return capacity;
}

// Calculate single Pokemon production given team context (bonus ayuda with 35% cap, realistic energy multiplier)
export function calculatePokemonProduction(
  pokemon: Pokemon,
  config: SnorlaxConfig,
  teamBonusAyudaCount: number,
  teamEnergyFactor: number
): PokemonProduction {
  // 1. Base frequency & official 35% Subskill Speed Cap (RaenonX datamine):
  // Subskill speed reductions (Velocidad ayuda S = 7%, Velocidad ayuda M = 14%, Bonus ayuda = 5% x portador)
  // sum additively in a single bucket strictly capped at 35%.
  const cleanName = pokemon.name.toLowerCase().trim();
  const master = getSpeciesMasterData(pokemon.name);

  let selfSpeedSub = 0;
  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Velocidad ayuda S') selfSpeedSub += 0.07;
    if (sub.name === 'Velocidad ayuda M') selfSpeedSub += 0.14;
  }

  let freq: number;
  if (pokemon.frequencySeconds && pokemon.frequencySeconds > 0) {
    // In-game profile card frequency already incorporates level, nature, and individual Velocidad S/M
    freq = pokemon.frequencySeconds;
  } else {
    const baseFreq = master && master.baseFrequency > 0 ? master.baseFrequency : 3600;
    const levelMod = Math.max(0.60, 1 - (pokemon.level - 1) * 0.002);
    const natureSpeedMod = pokemon.natureObj?.speedMod || 1.0;
    freq = Math.round(baseFreq * levelMod * natureSpeedMod * (1 - selfSpeedSub));
  }

  // Enforce strict 35% combined subskill cap without double-counting selfSpeedSub
  const totalSubskillSpeedReduction = Math.min(0.35, selfSpeedSub + teamBonusAyudaCount * 0.05);
  const teamSpeedFactor = (1 - totalSubskillSpeedReduction) / Math.max(0.5, 1 - selfSpeedSub);

  // Good Camp Ticket: helping speed increased by 20% (frequency divided by 1.2 = 0.8333x)
  const campSpeedMod = config.goodCampTicket ? (1 / 1.2) : 1.0;

  // Effective frequency with team energy multiplier
  const effectiveFrequency = (freq * teamSpeedFactor * campSpeedMod) / teamEnergyFactor;
  const helpsPerDay = Math.max(10, Math.floor(86400 / effectiveFrequency));

  // 5. Berry vs Ingredient probability with Day/Night cycle & Sneaky Snacking
  let baseIngChance = master && master.ingredientRate > 0 ? (master.ingredientRate / 100) : SPECIES_BASE_ING_RATES[cleanName];
  if (!baseIngChance) {
    if (pokemon.specialty === 'Ingredientes' || pokemon.specialty === 'Todo') baseIngChance = 0.26;
    else if (pokemon.specialty === 'Bayas') baseIngChance = 0.15;
    else baseIngChance = 0.18;
  }

  // Subskills for ingredients
  let ingSubskillMod = 1.0;
  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Más ingredientes S') ingSubskillMod += 0.18;
    if (sub.name === 'Más ingredientes M') ingSubskillMod += 0.36;
  }

  const natureIngMod = pokemon.natureObj?.ingMod || 1.0;
  const ingChance = Math.min(0.70, baseIngChance * ingSubskillMod * natureIngMod);

  // 6. Berry multiplier per help
  // WikiDex: Especialidad "Todo" (Mew, Darkrai) obtiene los efectos de Bayas (+1 baya = 2 base)
  let berriesPerHelp = (pokemon.specialty === 'Bayas' || pokemon.specialty === 'Todo') ? 2 : 1;
  const hasBFS = pokemon.subskills.some(s => s.enabled && s.name === 'Busca bayas S');
  if (hasBFS) berriesPerHelp += 1;

  // 7. Dynamic Inventory & Sneaky Snacking calculation
  let totalInventory: number;
  if (typeof pokemon.carryLimit === 'number' && pokemon.carryLimit > 0) {
    totalInventory = pokemon.carryLimit;
  } else {
    let baseInventory = master && master.carryLimit > 0 ? master.carryLimit : 15;
    if (!master) {
      if (['gengar', 'blastoise', 'charizard', 'venusaur', 'raichu', 'typhlosion', 'feraligatr', 'meganium', 'ampharos', 'tyranitar', 'walrein', 'gardevoir', 'gallade', 'magnezone', 'togekiss', 'dragonite', 'mew', 'mewtwo', 'raikou', 'entei', 'suicune'].some(s => cleanName.includes(s))) {
        baseInventory = 22;
      } else if (['haunter', 'espeon', 'flareon', 'vaporeon', 'jolteon', 'umbreon', 'leafeon', 'glaceon', 'sylveon', 'flaaffy', 'quilava', 'croconaw', 'bayleef', 'ivysaur', 'wartortle', 'charmeleon', 'graveler', 'dugtrio', 'sealeo', 'kirlia', 'pupitar', 'togetic', 'dragonair'].some(s => cleanName.includes(s))) {
        baseInventory = 16;
      } else if (pokemon.specialty === 'Ingredientes') {
        baseInventory = 15;
      }
    }

    let extraInventory = 0;
    for (const sub of pokemon.subskills) {
      if (!sub.enabled) continue;
      if (sub.name === 'Inventario S') extraInventory += 6;
      if (sub.name === 'Inventario M') extraInventory += 12;
      if (sub.name === 'Inventario L') extraInventory += 18;
    }

    totalInventory = baseInventory + extraInventory;
  }

  if (config.goodCampTicket) {
    totalInventory = Math.round(totalInventory * 1.20);
  }

  // Halloween 2026 Ghost Buff Detection:
  const isEvent = isHalloweenEventActive(config);
  const isGhost = isGhostPokemon(pokemon);
  const extraIng = (isEvent && isGhost) ? 1 : 0;

  // Average inventory slots filled per help:
  const avgItemsPerHelp = (1 - ingChance) * berriesPerHelp + ingChance * (2.2 + extraIng);
  const helpsToFill = totalInventory / Math.max(1, avgItemsPerHelp);
  const timeToFillHours = (helpsToFill * effectiveFrequency) / 3600;

  // Sleep hours (~8.5h): Inventory fills up to timeToFillHours, then 100% Sneaky Snacking (bayas directas a Snorlax, 0 ingredientes)
  const nightFillingHours = Math.min(8.5, Math.max(1.0, timeToFillHours));
  const nightSneakyHours = Math.max(0, 8.5 - nightFillingHours);

  const dayRatio = 15.5 / 24;
  const nightNormalRatio = nightFillingHours / 24;
  const nightSneakyRatio = nightSneakyHours / 24;

  const totalIngHelps = helpsPerDay * (dayRatio + nightNormalRatio) * ingChance;
  const totalBerryHelps = helpsPerDay * ((dayRatio + nightNormalRatio) * (1 - ingChance) + nightSneakyRatio);

  const isFavorite = config.favoriteBerries.some(fav => normalizeBerryName(fav) === normalizeBerryName(pokemon.berry));
  const favoriteMultiplier = isFavorite ? 2.0 : 1.0;
  const singleBerryVigor = getBerryVigor(pokemon.berry, pokemon.level);

  const dailyBerryVigor = Math.round(totalBerryHelps * berriesPerHelp * singleBerryVigor * favoriteMultiplier);

  // 8. Ingredient production (+1 extra ingredient per help for Ghost type during Halloween 2026)
  const activeIngSlots = pokemon.ingredients.filter(slot => slot.enabled);
  const dailyIngredients: Record<string, number> = {};

  if (activeIngSlots.length > 0) {
    const helpsPerSlot = totalIngHelps / activeIngSlots.length;

    for (const slot of activeIngSlots) {
      const produced = Math.round(helpsPerSlot * (slot.count + extraIng));
      dailyIngredients[slot.name] = (dailyIngredients[slot.name] || 0) + produced;
    }
  }

  // 9. Skill production (x1.25 trigger rate & +3 skill levels for Ghost type during Halloween 2026)
  let baseTriggerRate = master && master.skillRate > 0 ? (master.skillRate / 100) : 0.024;
  if (!master || master.skillRate <= 0) {
    if (pokemon.specialty === 'Habilidades') {
      baseTriggerRate = 0.042;
    } else if (pokemon.specialty === 'Todo') {
      baseTriggerRate = 0.048;
    }
  }
  let triggerSubskillBonus = 0;
  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Activación S') triggerSubskillBonus += 0.18;
    if (sub.name === 'Activación M') triggerSubskillBonus += 0.36;
  }
  const ghostSkillMod = (isEvent && isGhost) ? 1.25 : 1.0;
  const triggerMod = (1 + triggerSubskillBonus) * (pokemon.natureObj?.skillMod || 1.0) * ghostSkillMod;

  const skillTriggersPerDay = helpsPerDay * baseTriggerRate * triggerMod;
  const isHealer = isTeamHealer(pokemon);
  const extraSkillLevels = (isEvent && isGhost) ? 3 : 0;
  const effectiveSkillLevel = Math.min(7, getPokemonSkillLevel(pokemon) + extraSkillLevels);
  const normalizedSkillName = resolvePokemonMainSkill(pokemon);

  let dailySkillVigor = 0;
  if (!isHealer) {
    const vigorPerTrigger = getSkillVigorPerTrigger(pokemon, extraSkillLevels, { config });
    dailySkillVigor = Math.round(skillTriggersPerDay * vigorPerTrigger);
  }

  return {
    pokemon,
    effectiveFrequency,
    helpsPerDay,
    dailyBerryVigor,
    dailyIngredients,
    dailySkillVigor,
    skillTriggersPerDay,
    effectiveSkillLevel,
    normalizedSkillName,
    isHealer
  };
}

// Plan 3 meals strictly respecting:
// 1. effectivePotCapacity (base pot + skill pot expansions from Receta sustanciosa S / Llama Embrujada / Menos)
// 2. dailyPool availability (a recipe CANNOT be cooked if the team has not produced enough ingredients)
// 3. Persistent Extra Tasty stacking from Cocinitas S / Llama Embrujada / Corpulencia
export function planTeamMeals(
  dailyPool: Record<string, number>,
  config: SnorlaxConfig,
  partialTeamScale: number = 1.0,
  cookingSkillBonuses?: {
    bonusPotPerMeal?: number;
    dailyCritBonusPercent?: number;
  }
): { meals: MealPlan[]; totalCookingVigor: number; effectivePotPerMeal: number; effectiveCritRate: number } {
  const basePotCapacity = getEffectivePotCapacity(config);
  const bonusPotPerMeal = Math.max(0, Math.min(200, Math.round(cookingSkillBonuses?.bonusPotPerMeal || 0)));
  const effectivePotPerMeal = basePotCapacity + bonusPotPerMeal;

  // STRICT RULE 1: Only recipes of the week's dish type whose total ingredients <= effectivePotPerMeal
  const fittingRecipes = RECIPES.filter(r => {
    if (r.type !== config.dishType) return false;
    const requiredTotal = Object.values(r.ingredients).reduce((a, b) => a + b, 0);
    return requiredTotal <= effectivePotPerMeal;
  });

  // Sort candidate recipes by effective vigor (considering user's recipe level bonus) descending
  fittingRecipes.sort((a, b) => {
    const lvlA = config.recipeLevels?.[a.name] || 1;
    const lvlB = config.recipeLevels?.[b.name] || 1;
    const vigA = a.baseVigor * (1 + (DISH_LEVEL_BONUS[lvlA] || 0) / 100);
    const vigB = b.baseVigor * (1 + (DISH_LEVEL_BONUS[lvlB] || 0) / 100);
    return vigB - vigA;
  });

  // Expected multiplier for Extra Tasty (Riquísimo), including persistent skill stacking (RaenonX model):
  // Base: Mon-Sat 10% chance of 2x (+1.0x), Sun 30% chance of 3x (+2.0x). Max bonus stack = +70%.
  const baseCrit = config.isSunday ? 0.30 : 0.10;
  const maxCrit = config.isSunday ? 1.00 : 0.80;
  const critBonusMult = config.isSunday ? 2.0 : 1.0;
  const critAddedPerMeal = Math.max(0, (cookingSkillBonuses?.dailyCritBonusPercent || 0) / 100 / 3);

  let effectiveCritRate = baseCrit;
  if (critAddedPerMeal > 0) {
    for (let iter = 0; iter < 4; iter++) {
      const expectedPersistentStack = Math.min(0.70, (critAddedPerMeal * 0.5) * ((1 / Math.max(0.10, effectiveCritRate)) + 1));
      effectiveCritRate = Math.min(maxCrit, baseCrit + expectedPersistentStack);
    }
  }

  const extraTastyMultiplier = 1 + effectiveCritRate * critBonusMult;
  const areaBonusMultiplier = 1 + (config.areaBonus || 0) / 100;

  // If partialTeamScale < 1.0, scale the pool proportionally for recipe feasibility projection:
  const poolCopy: Record<string, number> = {};
  for (const [ing, qty] of Object.entries(dailyPool)) {
    poolCopy[ing] = partialTeamScale < 1.0 ? Math.floor(qty / partialTeamScale) : qty;
  }

  const mealNames: ('Desayuno' | 'Comida' | 'Cena')[] = ['Desayuno', 'Comida', 'Cena'];
  const meals: MealPlan[] = [];
  let totalCookingVigor = 0;

  // Step 1: Select the 3 recipes for the day, deducting required ingredients first (Reserve Rule)
  const chosenMealRecipes: { recipe: Recipe; isRealRecipe: boolean; recipeLevel: number; recipeVigor: number; recipeIngCount: number }[] = [];
  let dailyBagBufferUsed = 0;

  for (let i = 0; i < 3; i++) {
    let chosenRecipe: Recipe = MIXED_DISHES[config.dishType];
    let isRealRecipe = false;

    for (const recipe of fittingRecipes) {
      let canAfford = true;
      let bufferNeededThisRecipe = 0;

      for (const [ing, needed] of Object.entries(recipe.ingredients)) {
        const avail = poolCopy[ing] || 0;
        const missing = needed - avail;
        if (missing > 0) {
          if (missing <= 2 && (dailyBagBufferUsed + bufferNeededThisRecipe + missing) <= 4 && (avail / needed) >= 0.80) {
            bufferNeededThisRecipe += missing;
            continue;
          }
          canAfford = false;
          break;
        }
      }

      if (canAfford) {
        chosenRecipe = recipe;
        isRealRecipe = true;
        dailyBagBufferUsed += bufferNeededThisRecipe;
        for (const [ing, needed] of Object.entries(recipe.ingredients)) {
          poolCopy[ing] = Math.max(0, (poolCopy[ing] || 0) - needed);
        }
        break;
      }
    }

    let recipeVigor = 0;
    let recipeLevel = 1;
    let recipeIngCount = 0;

    if (isRealRecipe) {
      recipeIngCount = Object.values(chosenRecipe.ingredients).reduce((a, b) => a + b, 0);
      recipeLevel = config.recipeLevels?.[chosenRecipe.name] || 1;
      const levelBonusPercent = DISH_LEVEL_BONUS[recipeLevel] || 0;
      recipeVigor = Math.round(chosenRecipe.baseVigor * (1 + levelBonusPercent / 100));
    }

    chosenMealRecipes.push({
      recipe: chosenRecipe,
      isRealRecipe,
      recipeLevel,
      recipeVigor,
      recipeIngCount
    });
  }

  // Step 2: Allocate true surplus fairly across the 3 meals using effectivePotPerMeal:
  for (let i = 0; i < 3; i++) {
    const mealData = chosenMealRecipes[i];
    const { recipe: chosenRecipe, recipeLevel, recipeVigor, recipeIngCount } = mealData;

    let freeSpaces = Math.max(0, effectivePotPerMeal - recipeIngCount);
    const fillerMap: Record<string, { count: number; unitVigor: number }> = {};
    const remainingMeals = 3 - i;

    const surplusList = Object.entries(poolCopy)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => ({
        name,
        qty,
        unitVigor: INGREDIENTS[name]?.vigor || 100
      }))
      .sort((a, b) => b.unitVigor - a.unitVigor);

    // Pass 1: Proportional balanced distribution across remaining meals
    for (const surplus of surplusList) {
      if (freeSpaces <= 0) break;
      const fairShare = Math.min(surplus.qty, Math.ceil(surplus.qty / remainingMeals));
      const useCount = Math.min(fairShare, freeSpaces);
      if (useCount > 0) {
        fillerMap[surplus.name] = {
          count: (fillerMap[surplus.name]?.count || 0) + useCount,
          unitVigor: surplus.unitVigor
        };
        freeSpaces -= useCount;
        poolCopy[surplus.name] -= useCount;
      }
    }

    // Pass 2: Top off remaining pot space with best surplus
    if (freeSpaces > 0) {
      for (const surplus of surplusList) {
        if (freeSpaces <= 0) break;
        const avail = poolCopy[surplus.name] || 0;
        if (avail <= 0) continue;
        const useCount = Math.min(avail, freeSpaces);
        if (useCount > 0) {
          fillerMap[surplus.name] = {
            count: (fillerMap[surplus.name]?.count || 0) + useCount,
            unitVigor: surplus.unitVigor
          };
          freeSpaces -= useCount;
          poolCopy[surplus.name] -= useCount;
        }
      }
    }

    const fillerIngredients = Object.entries(fillerMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        unitVigor: data.unitVigor,
        totalVigor: data.count * data.unitVigor
      }))
      .sort((a, b) => b.unitVigor - a.unitVigor);

    const fillerVigor = fillerIngredients.reduce((acc, f) => acc + f.totalVigor, 0);

    const effectiveMealBase = partialTeamScale < 1.0
      ? Math.round((recipeVigor + fillerVigor) * partialTeamScale)
      : (recipeVigor + fillerVigor);

    const totalMealVigor = Math.round(effectiveMealBase * extraTastyMultiplier * areaBonusMultiplier);
    totalCookingVigor += totalMealVigor;

    meals.push({
      mealIndex: i,
      mealName: mealNames[i],
      recipe: chosenRecipe,
      recipeLevel,
      recipeVigor,
      fillerIngredients,
      fillerVigor,
      totalMealVigor
    });
  }

  return { meals, totalCookingVigor, effectivePotPerMeal, effectiveCritRate };
}

// Evaluate a full 5-pokemon team (or partial team during Beam Search)
export function evaluateTeam(team: Pokemon[], config: SnorlaxConfig): OptimizedTeamResult {
  const bonusAyudaCount = team.reduce(
    (acc, p) => acc + p.subskills.filter(s => s.enabled && s.name === 'Bonus ayuda').length,
    0
  );

  const { teamEnergyFactor, totalDailyHealedEnergy, hasEffectiveHealer } = calculateTeamEnergyFactor(team, config);

  const productions = team.map(p => calculatePokemonProduction(p, config, bonusAyudaCount, teamEnergyFactor));

  const isEvent = isHalloweenEventActive(config);
  const plusMinusCount = productions.filter(
    pr => pr.normalizedSkillName.includes('Más (Imán') || pr.normalizedSkillName.includes('Menos (Receta')
  ).length;

  let berryVigorDaily = 0;
  let skillVigorDaily = 0;
  let totalDailyPotExpansion = 0;
  let dailyCritBonusPercent = 0;
  let extraHelpsPerMember = 0;
  const dailyIngredientProduction: Record<string, number> = {};

  for (const prod of productions) {
    berryVigorDaily += prod.dailyBerryVigor;

    for (const [ing, count] of Object.entries(prod.dailyIngredients)) {
      dailyIngredientProduction[ing] = (dailyIngredientProduction[ing] || 0) + count;
    }

    if (prod.isHealer) continue;

    const sk = prod.normalizedSkillName;
    const lvl = prod.effectiveSkillLevel;
    const triggers = prod.skillTriggersPerDay;
    const isBeast = ['raikou', 'entei', 'suicune'].some(b => prod.pokemon.name.toLowerCase().includes(b));

    // 1. Cooking Pot & Extra Tasty skills -> simulated directly in planTeamMeals (zero double-counting!)
    if (
      sk.includes('Llama Embrujada') ||
      sk.includes('con sustancia') ||
      sk.includes('Receta sustanciosa') ||
      sk.includes('Menos (Receta') ||
      sk.includes('Cocinitas S') ||
      sk.includes('Corpulencia') ||
      sk.includes('Asistencia culinaria')
    ) {
      const { potBoost, critBoostPercent, randomIngredients } = getSkillCookingEffectPerTrigger(sk, lvl);
      totalDailyPotExpansion += triggers * potBoost;
      dailyCritBonusPercent += triggers * critBoostPercent;

      // Corpulencia (Heracross) also injects random ingredients into the bag
      if (randomIngredients > 0) {
        skillVigorDaily += Math.round(triggers * randomIngredients * 115);
      }
      // Menos (Minun / Toxtricity Low Key) restores energy to a teammate when paired with Más/Menos
      if (sk.includes('Menos (Receta') && plusMinusCount >= 2) {
        const bonusEnergy = [0, 5, 6, 8, 9, 11, 12, 14][lvl] || 6;
        skillVigorDaily += Math.round(triggers * bonusEnergy * 30);
      }
      continue;
    }

    // 2. Superútil S (Extra Helpful S) -> grants [6..12] instant helps to 1 random member on THIS team
    if (sk.includes('Superútil S')) {
      const helpsTable = [0, 6, 7, 8, 9, 10, 11, 12];
      const totalInstantHelps = triggers * (helpsTable[lvl] || 7);
      extraHelpsPerMember += totalInstantHelps / Math.max(1, team.length);
      continue;
    }

    // 3. Mejora de ayuda (Helper Boost — Raikou, Entei, Suicune) -> grants exact type-synergy helps to ALL members
    if (sk.includes('Mejora de ayuda') || (sk.includes('Impulso de ayuda') && isBeast)) {
      const helpsPerMember = getHelperBoostHelpsPerMember(prod.pokemon, lvl, team, config);
      extraHelpsPerMember += triggers * helpsPerMember;
      continue;
    }

    // 4. All other skills (Carga vigor M/S, Reserva, Imán ingredientes, Más, Bayamanía, Onda Mental, etc.)
    const extraLevels = (isEvent && isGhostPokemon(prod.pokemon)) ? 3 : 0;
    const vigorPerTrigger = getSkillVigorPerTrigger(prod.pokemon, extraLevels, { team, config });
    skillVigorDaily += Math.round(triggers * vigorPerTrigger);
  }

  // Apply real extra helps from Superútil S / Mejora de ayuda across the actual team members!
  if (extraHelpsPerMember > 0) {
    for (const prod of productions) {
      const helpRatio = extraHelpsPerMember / Math.max(10, prod.helpsPerDay);
      // Extra berries gathered go to Skill Vigor attribution so user sees the skill's exact strength contribution
      skillVigorDaily += Math.round(prod.dailyBerryVigor * helpRatio);
      // Extra ingredients gathered feed directly into the daily cooking pool!
      for (const [ing, count] of Object.entries(prod.dailyIngredients)) {
        dailyIngredientProduction[ing] = (dailyIngredientProduction[ing] || 0) + Math.round(count * helpRatio);
      }
    }
  }

  // Progressive recipe scaling for partial teams during Beam Search:
  const partialTeamScale = team.length > 0 ? Math.min(1.0, team.length / 5) : 1.0;
  const bonusPotPerMeal = Math.round(totalDailyPotExpansion / 3);

  // Plan 3 meals strictly with Area Bonus, Pot Expansion, and Persistent Extra Tasty stacking
  const { meals, totalCookingVigor, effectivePotPerMeal, effectiveCritRate } = planTeamMeals(
    dailyIngredientProduction,
    config,
    partialTeamScale,
    { bonusPotPerMeal, dailyCritBonusPercent }
  );

  // Apply Area Bonus to berries and skills
  const areaBonusMultiplier = 1 + (config.areaBonus || 0) / 100;
  const totalBerryVigorWithArea = Math.round(berryVigorDaily * areaBonusMultiplier);
  const totalSkillVigorWithArea = Math.round(skillVigorDaily * areaBonusMultiplier);

  const totalDailyVigor = totalBerryVigorWithArea + totalCookingVigor + totalSkillVigorWithArea;

  // Calculate optimization score according to chosen strategy
  let optimizationScore = totalDailyVigor;

  // During early Beam Search steps (team.length < 5), bridge pot/crit supports until ingredient farmers join on steps 4-5
  if (team.length < 5 && (bonusPotPerMeal > 0 || dailyCritBonusPercent > 0)) {
    const bridgeWeight = 1 - team.length / 5;
    optimizationScore += Math.round(bridgeWeight * (bonusPotPerMeal * 240 + dailyCritBonusPercent * 190) * areaBonusMultiplier);
  }

  const realMeals = meals.filter(m => m.recipe.baseVigor > 0);
  if (config.strategy === 'cooking') {
    optimizationScore += realMeals.length * 15000;
  } else if (config.strategy === 'berries') {
    optimizationScore += totalBerryVigorWithArea * 0.5;
  }

  // Build highlights
  const highlights: string[] = [];

  // Check Special Pokémon Limit (Official Sleep rule: Max 1 Legendary/Mythical per team; Eon duo Latias+Latios allowed)
  const specialPokemons = team.filter(p => isSpecialPokemon(p));
  const isEonDuo = specialPokemons.length === 2 &&
    specialPokemons.some(p => p.name.toLowerCase().includes('latias')) &&
    specialPokemons.some(p => p.name.toLowerCase().includes('latios'));

  if (specialPokemons.length > 1 && !isEonDuo) {
    const specialNames = specialPokemons.map(p => p.name).join(', ');
    highlights.unshift(`⚠️ Excede límite de Legendarios: ${specialNames} (${specialPokemons.length}/1 permitidos).`);
    optimizationScore -= 100000;
  }

  const favoriteCount = team.filter(p => config.favoriteBerries.some(fav => normalizeBerryName(fav) === normalizeBerryName(p.berry))).length;
  if (favoriteCount > 0) {
    highlights.push(`${favoriteCount} Pokémon con Baya Favorita (×2 Vigor).`);
  }
  const ghostCount = team.filter(p => isGhostPokemon(p)).length;
  if (isEvent && ghostCount > 0) {
    highlights.push(`🎃 Bonus Halloween activo: ${ghostCount} Pokémon Fantasma (+1 ingrediente, x1,25 activación, +3 niveles de habilidad).`);
  }
  if (hasEffectiveHealer) {
    highlights.push(`Sanador activo (+${Math.round(totalDailyHealedEnergy)} energía/día, factor ${teamEnergyFactor.toFixed(2)}x).`);
  } else if (totalDailyHealedEnergy > 0) {
    highlights.push(`Sanador en desarrollo (+${Math.round(totalDailyHealedEnergy)} energía/día, factor ${teamEnergyFactor.toFixed(2)}x).`);
  }
  if (bonusPotPerMeal > 0 || dailyCritBonusPercent > 0) {
    const parts: string[] = [];
    if (bonusPotPerMeal > 0) parts.push(`puchero expandido a ${effectivePotPerMeal} ing./comida (+${bonusPotPerMeal})`);
    if (dailyCritBonusPercent > 0) parts.push(`${Math.round(effectiveCritRate * 100)}% prob. efectiva de plato riquísimo`);
    highlights.push(`🍲 Habilidad culinaria activa: ${parts.join(' y ')}.`);
  }
  if (bonusAyudaCount > 0) {
    highlights.push(`Bonus Ayuda en equipo: -${Math.min(25, bonusAyudaCount * 5)}% tiempo base (tope oficial 35% con Vel. S/M).`);
  }
  if (config.areaBonus && config.areaBonus > 0) {
    highlights.push(`Bonus de Zona: +${config.areaBonus}% vigor universal.`);
  }
  if (config.goodCampTicket) {
    const effPot = getEffectivePotCapacity(config);
    highlights.push(`🏕️ Pase de Acampada activo: Puchero base ${effPot} ing. y +20% velocidad de ayuda.`);
  }

  // Recipe highlights
  if (realMeals.length > 0) {
    const uniqueRecipes = Array.from(new Set(realMeals.map(m => m.recipe.name)));
    highlights.push(`Platos cocinados: ${uniqueRecipes.join(', ')} (${realMeals.length}/3 comidas con receta).`);
  } else {
    highlights.push('Platos mixtos (0 recetas completadas: el equipo se enfoca en producción de bayas).');
  }

  return {
    team,
    totalDailyVigor,
    optimizationScore,
    berryVigorDaily: totalBerryVigorWithArea,
    cookingVigorDaily: totalCookingVigor,
    skillVigorDaily: totalSkillVigorWithArea,
    meals,
    highlights,
    dailyIngredientProduction
  };
}

// Heuristic score for ranking candidate Pokemon before Beam Search
function getPokemonScore(pokemon: Pokemon, config: SnorlaxConfig, reachablePotCapacity: number): number {
  let score = 0;
  const isFavorite = config.favoriteBerries.some(fav => normalizeBerryName(fav) === normalizeBerryName(pokemon.berry));
  const berryVal = getBerryVigor(pokemon.berry, pokemon.level);
  const master = getSpeciesMasterData(pokemon.name);
  const freq = (pokemon.frequencySeconds && pokemon.frequencySeconds > 0)
    ? Math.max(1200, pokemon.frequencySeconds)
    : (master && master.baseFrequency > 0 ? Math.max(1200, master.baseFrequency) : 3600);

  // 1. Berry Score
  let berries = (pokemon.specialty === 'Bayas' || pokemon.specialty === 'Todo') ? 2 : 1;
  if (pokemon.subskills.some(s => s.enabled && s.name === 'Busca bayas S')) berries += 1;
  const dailyHelps = (86400 / freq) * 1.42;
  const ingRate = master && master.ingredientRate > 0 ? (master.ingredientRate / 100) : (pokemon.specialty === 'Bayas' ? 0.15 : 0.25);
  const berryDaily = dailyHelps * (isFavorite ? 2 : 1) * berryVal * berries * (1 - ingRate);
  score += berryDaily;

  // 2. Ingredient Score: check if ingredients match fitting recipes (including pot-expander reachable recipes)
  const activeIngs = pokemon.ingredients.filter(i => i.enabled);
  let ingValuation = 0;
  const fittingRecipes = RECIPES.filter(
    r => r.type === config.dishType && Object.values(r.ingredients).reduce((a, b) => a + b, 0) <= reachablePotCapacity
  );

  for (const slot of activeIngs) {
    const unitVigor = INGREDIENTS[slot.name]?.vigor || 100;
    let matchBonus = 1.0;
    for (const r of fittingRecipes) {
      if (r.ingredients[slot.name]) {
        matchBonus += (r.baseVigor / 1000) * 0.3;
      }
    }
    ingValuation += slot.count * unitVigor * matchBonus;
  }

  if (pokemon.specialty === 'Ingredientes') {
    score += ingValuation * 25;
  } else if (pokemon.specialty === 'Todo') {
    score += ingValuation * 20;
  } else {
    score += ingValuation * 8;
  }

  // 3. Healer / Skill bonus weighted by ACTUAL species trigger rate, speed, nature & subskills
  const isHealer = isTeamHealer(pokemon);
  const isEvent = isHalloweenEventActive(config);
  const isGhost = isGhostPokemon(pokemon);
  const extraSkillLevels = (isEvent && isGhost) ? 3 : 0;
  const skillLvl = Math.min(7, getPokemonSkillLevel(pokemon) + extraSkillLevels);

  let baseSkillRate = master && master.skillRate > 0 ? (master.skillRate / 100) : 0.024;
  if (!master || master.skillRate <= 0) {
    if (pokemon.specialty === 'Habilidades') baseSkillRate = 0.042;
    else if (pokemon.specialty === 'Todo') baseSkillRate = 0.048;
  }
  let trigSub = 0;
  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Activación S') trigSub += 0.18;
    if (sub.name === 'Activación M') trigSub += 0.36;
  }
  const expectedDailyTriggers = dailyHelps * baseSkillRate * (1 + trigSub) * (pokemon.natureObj?.skillMod || 1.0) * ((isEvent && isGhost) ? 1.25 : 1.0);

  if (isHealer) {
    score += skillLvl * 2600 + expectedDailyTriggers * 900;
  } else if (pokemon.specialty === 'Habilidades' || pokemon.specialty === 'Todo') {
    const vigorPerTrigger = getSkillVigorPerTrigger(pokemon, extraSkillLevels, { config });
    score += expectedDailyTriggers * vigorPerTrigger * (config.strategy === 'cooking' && resolvePokemonMainSkill(pokemon).match(/Receta|Llama Embrujada|Cocinitas|Corpulencia/) ? 1.45 : 1.15);
  }

  // Level & RP
  score += pokemon.level * 60;
  score += pokemon.rp * 0.8;

  return score;
}

// Find top teams using Beam Search with balanced candidate pool
export function optimizeTeam(
  allPokemons: Pokemon[],
  config: SnorlaxConfig,
  limitResults: number = 3
): OptimizedTeamResult[] {
  if (allPokemons.length < 5) {
    if (allPokemons.length === 0) return [];
    return [evaluateTeam(allPokemons, config)];
  }

  const potCapacity = getEffectivePotCapacity(config);

  // Detect if user owns a Pot Expander (Mismagius, Magnezone, Flareon, Glaceon, Minun, etc.)
  // so candidate selection also recruits farmers for larger pot-expanded recipes!
  const isEvent = isHalloweenEventActive(config);
  let maxBoxPotBoostPerMeal = 0;
  for (const p of allPokemons) {
    const sk = resolvePokemonMainSkill(p);
    const extraLvls = (isEvent && isGhostPokemon(p)) ? 3 : 0;
    const lvl = Math.min(7, getPokemonSkillLevel(p) + extraLvls);
    const { potBoost } = getSkillCookingEffectPerTrigger(sk, lvl);
    if (potBoost > 0) {
      maxBoxPotBoostPerMeal = Math.max(maxBoxPotBoostPerMeal, potBoost);
    }
  }
  const reachablePotCapacity = potCapacity + maxBoxPotBoostPerMeal;

  // Form a balanced candidate pool so Beam Search tests top berry gatherers, skill supports, AND ingredient gatherers:
  const scoredAll = allPokemons.map(p => ({
    pokemon: p,
    score: getPokemonScore(p, config, reachablePotCapacity)
  }));

  // Separate by specialty (WikiDex: Todo combines effects of Bayas, Ingredientes and Habilidades)
  const berryMons = scoredAll.filter(x => x.pokemon.specialty === 'Bayas' || x.pokemon.specialty === 'Todo').sort((a, b) => b.score - a.score);
  const ingMons = scoredAll.filter(x => x.pokemon.specialty === 'Ingredientes' || x.pokemon.specialty === 'Todo').sort((a, b) => b.score - a.score);
  const skillMons = scoredAll.filter(x => x.pokemon.specialty === 'Habilidades' || x.pokemon.specialty === 'Todo').sort((a, b) => b.score - a.score);

  // Take top candidates from each category
  const selectedCandidates: Pokemon[] = [];
  const candidateIds = new Set<string>();

  const addPokemon = (p: Pokemon) => {
    if (!candidateIds.has(p.id)) {
      candidateIds.add(p.id);
      selectedCandidates.push(p);
    }
  };

  // Bucket 1: Top 12 Berry mons
  berryMons.slice(0, 12).forEach(x => addPokemon(x.pokemon));

  // Bucket 2: Top 4 Healers (E4E)
  const healers = allPokemons.filter(p => isTeamHealer(p)).sort((a, b) => b.level - a.level);
  healers.slice(0, 4).forEach(addPokemon);

  // Bucket 3: Top 8 Skills / Cooking Support (Mismagius, Magnezone, Dedenne, Ampharos, Mew, etc.)
  skillMons.slice(0, 8).forEach(x => addPokemon(x.pokemon));

  // Bucket 4: CRITICAL INGREDIENT QUOTAS (including recipes unlocked by Pot Expanders!):
  const requiredIngredients = new Set<string>();
  RECIPES
    .filter(r => r.type === config.dishType && Object.values(r.ingredients).reduce((a, b) => a + b, 0) <= reachablePotCapacity)
    .forEach(r => {
      Object.keys(r.ingredients).forEach(ing => requiredIngredients.add(ing));
    });

  for (const ing of requiredIngredients) {
    const producers = allPokemons
      .filter(p => p.ingredients.some(s => s.enabled && s.name === ing))
      .map(p => {
        const slot = p.ingredients.find(s => s.enabled && s.name === ing)!;
        const master = getSpeciesMasterData(p.name);
        const ingRate = master && master.ingredientRate > 0 ? (master.ingredientRate / 100) : (p.specialty === 'Ingredientes' ? 0.26 : 0.18);
        const freq = (p.frequencySeconds && p.frequencySeconds > 0) ? p.frequencySeconds : (master && master.baseFrequency > 0 ? master.baseFrequency : 3600);
        const rate = (slot.count * 86400 * ingRate) / freq;
        return { pokemon: p, rate };
      })
      .sort((a, b) => b.rate - a.rate);

    producers.slice(0, 2).forEach(x => addPokemon(x.pokemon));
  }

  // Bucket 5: Top overall scored mons to fill up to 36 candidates
  scoredAll.sort((a, b) => b.score - a.score);
  for (const item of scoredAll) {
    if (selectedCandidates.length >= 36) break;
    addPokemon(item.pokemon);
  }

  // Beam Search with Canonical Deduplication
  const BEAM_WIDTH = 25;
  let beams: Pokemon[][] = selectedCandidates.slice(0, BEAM_WIDTH).map(p => [p]);

  for (let teamSize = 2; teamSize <= 5; teamSize++) {
    const nextBeams: { team: Pokemon[]; score: number }[] = [];
    const seenCanonKeys = new Set<string>();

    for (const partialTeam of beams) {
      const hasSpecial = partialTeam.some(p => isSpecialPokemon(p));

      for (const candidate of selectedCandidates) {
        if (partialTeam.some(p => p.id === candidate.id)) continue;

        // OFFICIAL SLEEP RULE: At most 1 Special / Legendary / Mythical Pokémon per team!
        // Exception: Latias and Latios (the Eon duo) can team up together!
        if (isSpecialPokemon(candidate)) {
          const specials = partialTeam.filter(p => isSpecialPokemon(p));
          if (specials.length > 0) {
            const isEonPair = specials.length === 1 &&
              ((candidate.name.toLowerCase().includes('latias') && specials[0].name.toLowerCase().includes('latios')) ||
               (candidate.name.toLowerCase().includes('latios') && specials[0].name.toLowerCase().includes('latias')));
            if (!isEonPair) continue;
          }
        }

        const newTeam = [...partialTeam, candidate];

        // Canonical deduplication before evaluation:
        // [A, B] and [B, A] produce the same key; only evaluate unique teams
        const canonKey = newTeam.map(p => p.id).sort().join('|');
        if (seenCanonKeys.has(canonKey)) continue;
        seenCanonKeys.add(canonKey);

        const result = evaluateTeam(newTeam, config);
        nextBeams.push({ team: newTeam, score: result.optimizationScore ?? result.totalDailyVigor });
      }
    }

    nextBeams.sort((a, b) => b.score - a.score);
    beams = nextBeams.slice(0, BEAM_WIDTH).map(x => x.team);
  }

  // Local Improvement (1-swap hill climbing)
  const finalResults: OptimizedTeamResult[] = [];
  const evaluatedKeys = new Set<string>();

  for (const team of beams.slice(0, 10)) {
    let currentTeam = [...team];
    let bestResult = evaluateTeam(currentTeam, config);
    let bestScore = bestResult.optimizationScore ?? bestResult.totalDailyVigor;

    let improved = true;
    let iterations = 0;

    while (improved && iterations < 3) {
      improved = false;
      iterations++;

      for (let i = 0; i < 5; i++) {
        for (const candidate of selectedCandidates) {
          if (currentTeam.some(p => p.id === candidate.id)) continue;

          // Official Sleep Rule: At most 1 Special / Legendary on swap, except Latias + Latios
          if (isSpecialPokemon(candidate)) {
            const otherSpecials = currentTeam.filter((p, idx) => idx !== i && isSpecialPokemon(p));
            if (otherSpecials.length > 0) {
              const isEonPair = otherSpecials.length === 1 &&
                ((candidate.name.toLowerCase().includes('latias') && otherSpecials[0].name.toLowerCase().includes('latios')) ||
                 (candidate.name.toLowerCase().includes('latios') && otherSpecials[0].name.toLowerCase().includes('latias')));
              if (!isEonPair) continue;
            }
          }

          const testTeam = [...currentTeam];
          testTeam[i] = candidate;
          const testResult = evaluateTeam(testTeam, config);
          const testScore = testResult.optimizationScore ?? testResult.totalDailyVigor;

          if (testScore > bestScore) {
            currentTeam = testTeam;
            bestResult = testResult;
            bestScore = testScore;
            improved = true;
          }
        }
      }
    }

    const teamKey = bestResult.team.map(p => p.id).sort().join('|');
    if (!evaluatedKeys.has(teamKey)) {
      evaluatedKeys.add(teamKey);
      finalResults.push(bestResult);
    }
  }

  finalResults.sort((a, b) => (b.optimizationScore ?? b.totalDailyVigor) - (a.optimizationScore ?? a.totalDailyVigor));
  return finalResults.slice(0, limitResults);
}
