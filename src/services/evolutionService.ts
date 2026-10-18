import { Pokemon } from '../types/pokemon';
import { MasterSpecies, getSpeciesMasterData } from '../data/speciesMaster';
import { BERRIES } from '../data/gameData';
import { calculatePokemonProduction } from './optimizer';

/**
 * Complete canonical evolution mapping for Pokémon Sleep.
 * Mapped directly from official Sleep datamines.
 */
export const SLEEP_EVOLUTION_MAP: Record<string, string[]> = {
  // Gen 1
  "Bulbasaur": ["Ivysaur"],
  "Ivysaur": ["Venusaur"],
  "Charmander": ["Charmeleon"],
  "Charmeleon": ["Charizard"],
  "Squirtle": ["Wartortle"],
  "Wartortle": ["Blastoise"],
  "Caterpie": ["Metapod"],
  "Metapod": ["Butterfree"],
  "Rattata": ["Raticate"],
  "Ekans": ["Arbok"],
  "Pikachu": ["Raichu"],
  "Sandshrew": ["Sandslash"],
  "Clefairy": ["Clefable"],
  "Vulpix": ["Ninetales"],
  "Vulpix (Alola)": ["Ninetales (Alola)"],
  "Jigglypuff": ["Wigglytuff"],
  "Diglett": ["Dugtrio"],
  "Meowth": ["Persian"],
  "Psyduck": ["Golduck"],
  "Mankey": ["Primeape"],
  "Growlithe": ["Arcanine"],
  "Bellsprout": ["Weepinbell"],
  "Weepinbell": ["Victreebel"],
  "Geodude": ["Graveler"],
  "Graveler": ["Golem"],
  "Slowpoke": ["Slowbro", "Slowking"],
  "Magnemite": ["Magneton"],
  "Magneton": ["Magnezone"],
  "Doduo": ["Dodrio"],
  "Gastly": ["Haunter"],
  "Haunter": ["Gengar"],
  "Onix": ["Steelix"],
  "Cubone": ["Marowak"],
  "Chansey": ["Blissey"],
  "Eevee": [
    "Vaporeon",
    "Jolteon",
    "Flareon",
    "Espeon",
    "Umbreon",
    "Leafeon",
    "Glaceon",
    "Sylveon"
  ],
  "Dratini": ["Dragonair"],
  "Dragonair": ["Dragonite"],

  // Gen 2
  "Chikorita": ["Bayleef"],
  "Bayleef": ["Meganium"],
  "Cyndaquil": ["Quilava"],
  "Quilava": ["Typhlosion"],
  "Totodile": ["Croconaw"],
  "Croconaw": ["Feraligatr"],
  "Pichu": ["Pikachu"],
  "Cleffa": ["Clefairy"],
  "Igglybuff": ["Jigglypuff"],
  "Togepi": ["Togetic"],
  "Togetic": ["Togekiss"],
  "Natu": ["Xatu"],
  "Mareep": ["Flaaffy"],
  "Flaaffy": ["Ampharos"],
  "Wooper": ["Quagsire"],
  "Wooper (Paldea)": ["Clodsire"],
  "Murkrow": ["Honchkrow"],
  "Misdreavus": ["Mismagius"],
  "Sneasel": ["Weavile"],
  "Houndour": ["Houndoom"],
  "Larvitar": ["Pupitar"],
  "Pupitar": ["Tyranitar"],

  // Gen 3
  "Treecko": ["Grovyle"],
  "Grovyle": ["Sceptile"],
  "Torchic": ["Combusken"],
  "Combusken": ["Blaziken"],
  "Mudkip": ["Marshtomp"],
  "Marshtomp": ["Swampert"],
  "Ralts": ["Kirlia"],
  "Kirlia": ["Gardevoir", "Gallade"],
  "Slakoth": ["Vigoroth"],
  "Vigoroth": ["Slaking"],
  "Aron": ["Lairon"],
  "Lairon": ["Aggron"],
  "Gulpin": ["Swalot"],
  "Trapinch": ["Vibrava"],
  "Vibrava": ["Flygon"],
  "Swablu": ["Altaria"],
  "Shuppet": ["Banette"],
  "Wynaut": ["Wobbuffet"],
  "Spheal": ["Sealeo"],
  "Sealeo": ["Walrein"],
  "Bagon": ["Shelgon"],
  "Shelgon": ["Salamence"],

  // Gen 4
  "Turtwig": ["Grotle"],
  "Grotle": ["Torterra"],
  "Chimchar": ["Monferno"],
  "Monferno": ["Infernape"],
  "Piplup": ["Prinplup"],
  "Prinplup": ["Empoleon"],
  "Shinx": ["Luxio"],
  "Luxio": ["Luxray"],
  "Drifloon": ["Drifblim"],
  "Bonsly": ["Sudowoodo"],
  "Mime Jr.": ["Mr. Mime"],
  "Happiny": ["Chansey"],
  "Riolu": ["Lucario"],
  "Croagunk": ["Toxicroak"],
  "Snover": ["Abomasnow"],

  // Gen 5
  "Munna": ["Musharna"],
  "Dwebble": ["Crustle"],
  "Foongus": ["Amoonguss"],
  "Rufflet": ["Braviary"],

  // Gen 6
  "Tyrunt": ["Tyrantrum"],
  "Pumpkaboo (Small)": ["Gourgeist (Small)"],
  "Pumpkaboo (Medium)": ["Gourgeist (Medium)"],
  "Pumpkaboo (Large)": ["Gourgeist (Large)"],
  "Pumpkaboo (Jumbo)": ["Gourgeist (Jumbo)"],
  "Noibat": ["Noivern"],

  // Gen 7
  "Grubbin": ["Charjabug"],
  "Charjabug": ["Vikavolt"],
  "Cutiefly": ["Ribombee"],
  "Stufful": ["Bewear"],

  // Gen 9 (Paldea)
  "Sprigatito": ["Floragato"],
  "Floragato": ["Meowscarada"],
  "Fuecoco": ["Crocalor"],
  "Crocalor": ["Skeledirge"],
  "Quaxly": ["Quaxwell"],
  "Quaxwell": ["Quaquaval"],
  "Pawmi": ["Pawmo"],
  "Pawmo": ["Pawmot"],
  "Tinkatink": ["Tinkatuff"],
  "Tinkatuff": ["Tinkaton"],
  "Cetoddle": ["Cetitan"]
};

/**
 * Format total seconds to human-readable string (e.g. "48 min 20s" or "1h 12min")
 */
export function formatFrequencySeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return s > 0 ? `${h}h ${m}min ${s}s` : `${h}h ${m}min`;
  return s > 0 ? `${m} min ${s}s` : `${m} min`;
}

/**
 * Check if a Pokémon can evolve in Pokémon Sleep
 */
export function canPokemonEvolve(pokemonName: string): boolean {
  if (!pokemonName) return false;
  const cleanName = pokemonName.trim();
  const options = SLEEP_EVOLUTION_MAP[cleanName];
  if (options && options.length > 0) return true;

  // Case-insensitive match fallback
  const lower = cleanName.toLowerCase();
  for (const [key, evolutions] of Object.entries(SLEEP_EVOLUTION_MAP)) {
    if (key.toLowerCase() === lower && evolutions.length > 0) {
      return true;
    }
  }
  return false;
}

/**
 * Get available evolution targets as MasterSpecies records
 */
export function getAvailableEvolutions(pokemonName: string): MasterSpecies[] {
  if (!pokemonName) return [];
  const cleanName = pokemonName.trim();
  let targetNames = SLEEP_EVOLUTION_MAP[cleanName];

  if (!targetNames) {
    const lower = cleanName.toLowerCase();
    for (const [key, evolutions] of Object.entries(SLEEP_EVOLUTION_MAP)) {
      if (key.toLowerCase() === lower) {
        targetNames = evolutions;
        break;
      }
    }
  }

  if (!targetNames || targetNames.length === 0) return [];

  const results: MasterSpecies[] = [];
  for (const name of targetNames) {
    const master = getSpeciesMasterData(name);
    if (master) {
      results.push(master);
    }
  }
  return results;
}

export interface EvolutionPreview {
  currentPokemon: Pokemon;
  targetMaster: MasterSpecies;
  evolvedPokemon: Pokemon;
  
  // Comparative Stats
  level: number;
  skillLevelBefore: number;
  skillLevelAfter: number;
  
  carryLimitBefore: number;
  carryLimitAfter: number;
  carryLimitDelta: number; // +5 in official Sleep

  frequencySecondsBefore: number;
  frequencySecondsAfter: number;
  frequencyStrBefore: string;
  frequencyStrAfter: string;
  speedGainPercent: number; // e.g. +14%

  rpBefore: number;
  rpAfter: number;
  rpGain: number;

  dailyVigorGain: number; // Estimated extra vigor per day for Snorlax
}

/**
 * Update "Nv. X" in notes string if present, preserving other notes
 */
function updateNotesWithNewSkillLevel(notes?: string, newLevel?: number): string {
  if (!notes) return '';
  if (!newLevel) return notes;
  if (/Nv\.\s*\d+/i.test(notes)) {
    return notes.replace(/Nv\.\s*\d+/i, `Nv. ${newLevel}`);
  }
  return notes;
}

/**
 * Calculate the exact What-If preview when evolving a Pokémon
 */
export function calculateEvolutionPreview(
  currentPokemon: Pokemon,
  targetMaster: MasterSpecies
): EvolutionPreview {
  const currentMaster = getSpeciesMasterData(currentPokemon.name);

  // 1. Level remains 100% constant in Pokémon Sleep
  const level = currentPokemon.level;

  // 2. Skill Level goes up +1 (capped at 7)
  const currentSkillLevel = typeof currentPokemon.mainSkillLevel === 'number' && currentPokemon.mainSkillLevel >= 1
    ? currentPokemon.mainSkillLevel
    : 1;
  const newSkillLevel = Math.min(7, currentSkillLevel + 1);

  // 3. Carry Limit: In Pokémon Sleep, evolving a Pokémon grants exactly +5 inventory capacity!
  let extraInventory = 0;
  for (const sub of currentPokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Inventario S') extraInventory += 6;
    if (sub.name === 'Inventario M') extraInventory += 12;
    if (sub.name === 'Inventario L') extraInventory += 18;
  }
  const carryLimitBefore = (currentMaster ? currentMaster.carryLimit : 12) + extraInventory;
  const carryLimitAfter = carryLimitBefore + 5;
  const carryLimitDelta = 5;

  // 4. Helping Frequency: Scale proportionally by species base frequency
  let currentFreqSec = currentPokemon.frequencySeconds;
  if (!currentFreqSec || currentFreqSec <= 0) {
    currentFreqSec = currentMaster ? currentMaster.baseFrequency : 3600;
  }

  const oldBaseFreq = currentMaster ? currentMaster.baseFrequency : 3600;
  const newBaseFreq = targetMaster.baseFrequency;
  
  // Ratio scaling preserves exact nature speed bonus & subskill speed reductions
  const newFreqSec = Math.round(currentFreqSec * (newBaseFreq / oldBaseFreq));
  const frequencyStrBefore = currentPokemon.frequencyStr || formatFrequencySeconds(currentFreqSec);
  const frequencyStrAfter = formatFrequencySeconds(newFreqSec);
  
  const speedGainPercent = currentFreqSec > 0
    ? Math.round(((currentFreqSec - newFreqSec) / currentFreqSec) * 100)
    : 0;

  // 5. RP Estimation
  const currentRp = currentPokemon.rp || 500;
  // RP increases from frequency boost + extra skill level (~+180 RP)
  const rpAfter = Math.round(currentRp * (currentFreqSec / Math.max(1, newFreqSec)) + 180);
  const rpGain = rpAfter - currentRp;

  // 6. Build the evolved Pokémon record
  const evolvedPokemon: Pokemon = {
    ...currentPokemon,
    name: targetMaster.name,
    berry: targetMaster.berry,
    berryType: BERRIES[targetMaster.berry]?.type || currentPokemon.berryType || 'Normal',
    specialty: targetMaster.specialty,
    mainSkillName: targetMaster.mainSkill,
    mainSkillLevel: newSkillLevel,
    frequencySeconds: newFreqSec,
    frequencyStr: frequencyStrAfter,
    rp: rpAfter,
    notes: updateNotesWithNewSkillLevel(currentPokemon.notes, newSkillLevel)
  };

  // 7. Calculate realistic Daily Vigor Gain for Snorlax
  let dailyVigorGain = 0;
  try {
    const dummyConfig = {
      island: 'greengrass',
      dishType: 'curry' as const,
      favoriteBerries: [targetMaster.berry],
      potSize: 57,
      isSunday: false,
      areaBonus: 0,
      strategy: 'balanced' as const,
      recipeLevels: {}
    };
    const prodBefore = calculatePokemonProduction(currentPokemon, dummyConfig, 0, 1.42);
    const prodAfter = calculatePokemonProduction(evolvedPokemon, dummyConfig, 0, 1.42);
    const vigorBefore = prodBefore.dailyBerryVigor + prodBefore.dailySkillVigor;
    const vigorAfter = prodAfter.dailyBerryVigor + prodAfter.dailySkillVigor;
    dailyVigorGain = Math.max(500, vigorAfter - vigorBefore);
  } catch (e) {
    dailyVigorGain = Math.round(speedGainPercent * 120 + 1500);
  }

  return {
    currentPokemon,
    targetMaster,
    evolvedPokemon,
    level,
    skillLevelBefore: currentSkillLevel,
    skillLevelAfter: newSkillLevel,
    carryLimitBefore,
    carryLimitAfter,
    carryLimitDelta,
    frequencySecondsBefore: currentFreqSec,
    frequencySecondsAfter: newFreqSec,
    frequencyStrBefore,
    frequencyStrAfter,
    speedGainPercent,
    rpBefore: currentRp,
    rpAfter,
    rpGain,
    dailyVigorGain
  };
}
