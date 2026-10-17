import { Pokemon, Recipe, SnorlaxConfig, OptimizedTeamResult, MealPlan, DishType } from '../types/pokemon';
import { INGREDIENTS, RECIPES, DISH_LEVEL_BONUS, getBerryVigor, POT_SIZES } from '../data/gameData';
import { getPokemonCanonicalSkill, isSpecialPokemon } from './pokeApiService';

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
  isHealer: boolean;
}

// Determine actual skill level from notes, evolution stage and subskills
export function getPokemonSkillLevel(pokemon: Pokemon): number {
  const noteMatch = pokemon.notes?.match(/Nv\.\s*(\d+)/i);
  let baseLevel = 1;

  if (noteMatch) {
    const parsed = parseInt(noteMatch[1], 10);
    if (parsed >= 1 && parsed <= 6) {
      baseLevel = parsed;
    }
  } else {
    const name = pokemon.name.toLowerCase();
    if (['gengar', 'blastoise', 'charizard', 'venusaur', 'raichu', 'typhlosion', 'feraligatr', 'meganium', 'ampharos', 'tyranitar', 'walrein', 'gardevoir', 'gallade', 'magnezone', 'togekiss'].some(s => name.includes(s))) {
      baseLevel = 3;
    } else if (['haunter', 'espeon', 'flareon', 'vaporeon', 'jolteon', 'umbreon', 'leafeon', 'glaceon', 'sylveon', 'flaaffy', 'quilava', 'croconaw', 'bayleef', 'ivysaur', 'wartortle', 'charmeleon', 'graveler', 'dugtrio', 'sealeo', 'kirlia', 'pupitar', 'togetic'].some(s => name.includes(s))) {
      baseLevel = 2;
    }
  }

  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Nivel habilidad S') baseLevel += 1;
    if (sub.name === 'Nivel habilidad M') baseLevel += 2;
  }

  return Math.min(6, Math.max(1, baseLevel));
}

// Calculate realistic vigor per trigger according to official Sleep tables
export function getSkillVigorPerTrigger(pokemon: Pokemon): number {
  const skillLevel = getPokemonSkillLevel(pokemon);
  const mainSkill = pokemon.mainSkillName || getPokemonCanonicalSkill(pokemon.name);

  if (mainSkill.includes('Carga vigor M')) {
    const table = [0, 880, 1251, 1726, 2383, 3290, 4546];
    return table[skillLevel] || 1726;
  }

  if (mainSkill.includes('Carga vigor S')) {
    const table = [0, 400, 569, 785, 1083, 1496, 2066];
    return table[skillLevel] || 785;
  }

  if (mainSkill.includes('Imán ingredientes S')) {
    // Ingredient Magnet grants ingredients consumed via Cooking pot. Direct vigor is 0 to avoid double-counting.
    return 0;
  }

  if (mainSkill.includes('Metrónomo')) {
    // Metronome picks randomly among 18 main skills. Expected direct vigor per trigger:
    const table = [0, 450, 650, 900, 1150, 1450, 1850];
    return table[skillLevel] || 1150;
  }

  if (mainSkill.includes('Superútil S') || mainSkill.includes('Impulso de ayuda S')) {
    const helps = [0, 4, 5, 6, 7, 8, 9];
    return (helps[skillLevel] || 5) * 350;
  }

  if (mainSkill.includes('Bayamanía')) {
    const table = [0, 800, 1200, 1800, 2500, 3400, 4500];
    return table[skillLevel] || 1800;
  }

  if (mainSkill.includes('Onda Mental') || mainSkill.includes('Mal Sueño')) {
    return 2000 + skillLevel * 500;
  }

  return 300 + skillLevel * 150;
}

// Calculate realistic team energy speed multiplier based on ACTUAL healing output
export function calculateTeamEnergyFactor(team: Pokemon[]): {
  teamEnergyFactor: number;
  totalDailyHealedEnergy: number;
  hasEffectiveHealer: boolean;
} {
  const BASE_ENERGY_FACTOR = 1.42;
  const MAX_HEALER_BONUS = 0.68; // 1.42 + 0.68 = 2.10 max

  const healers = team.filter(p => {
    const name = p.name.toLowerCase();
    const skill = p.mainSkillName || getPokemonCanonicalSkill(p.name);
    return skill.includes('Energía para todos') ||
      ['jigglypuff', 'wigglytuff', 'igglybuff', 'pawmi', 'pawmo', 'pawmot', 'ralts', 'kirlia', 'gardevoir', 'sylveon'].some(h => name.includes(h));
  });

  if (healers.length === 0) {
    return { teamEnergyFactor: BASE_ENERGY_FACTOR, totalDailyHealedEnergy: 0, hasEffectiveHealer: false };
  }

  let totalDailyHealedEnergy = 0;

  for (const healer of healers) {
    const name = healer.name.toLowerCase();
    let baseTriggerRate = 0.035;
    if (name.includes('gardevoir') || name.includes('wigglytuff')) baseTriggerRate = 0.045;
    else if (name.includes('sylveon')) baseTriggerRate = 0.040;
    else if (name.includes('jigglypuff') || name.includes('kirlia') || name.includes('pawmo')) baseTriggerRate = 0.028;
    else if (name.includes('igglybuff') || name.includes('pawmi') || name.includes('ralts')) baseTriggerRate = 0.018;

    let triggerMod = 1.0;
    for (const sub of healer.subskills) {
      if (!sub.enabled) continue;
      if (sub.name === 'Activación S') triggerMod *= 1.18;
      if (sub.name === 'Activación M') triggerMod *= 1.36;
    }
    triggerMod *= (healer.natureObj?.skillMod || 1.0);

    const effectiveTriggerRate = baseTriggerRate * triggerMod;

    let freq = healer.frequencySeconds;
    let subskillSpeedReduction = 0;
    for (const sub of healer.subskills) {
      if (!sub.enabled) continue;
      if (sub.name === 'Velocidad ayuda S') subskillSpeedReduction += 0.07;
      if (sub.name === 'Velocidad ayuda M') subskillSpeedReduction += 0.14;
    }
    subskillSpeedReduction = Math.min(0.35, subskillSpeedReduction);
    freq *= (1 - subskillSpeedReduction) * (healer.natureObj?.speedMod || 1.0);
    const approxHelpsPerDay = Math.floor(86400 / (freq / BASE_ENERGY_FACTOR));

    const dailyTriggers = approxHelpsPerDay * effectiveTriggerRate;

    const skillLevel = getPokemonSkillLevel(healer);
    const healTable = [0, 5, 7, 9, 11, 15, 18];
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

// Calculate single Pokemon production given team context (bonus ayuda, realistic energy multiplier)
export function calculatePokemonProduction(
  pokemon: Pokemon,
  config: SnorlaxConfig,
  teamBonusAyudaCount: number,
  teamEnergyFactor: number
): PokemonProduction {
  // 1. Base frequency:
  // In Pokémon Sleep, the frequency displayed on the in-game profile card (pokemon.frequencySeconds)
  // already incorporates the Pokémon's individual level, nature speed modifier, and active subskills (Velocidad S/M).
  // Only external team boosts (Helping Bonus from teammates) and Good Camp Ticket modify this interval.
  let freq = pokemon.frequencySeconds;

  // External teammate Helping Bonus (5% per teammate, max 25%)
  const teammateSpeedReduction = Math.min(0.25, teamBonusAyudaCount * 0.05);
  const teamSpeedFactor = 1 - teammateSpeedReduction;

  // Good Camp Ticket: helping speed increased by 20% (time interval reduced to 0.80x)
  const campSpeedMod = config.goodCampTicket ? 0.80 : 1.0;

  // Effective frequency with team energy multiplier
  const effectiveFrequency = (freq * teamSpeedFactor * campSpeedMod) / teamEnergyFactor;
  const helpsPerDay = Math.max(10, Math.floor(86400 / effectiveFrequency));

  // 5. Berry vs Ingredient probability with Day/Night cycle & Sneaky Snacking
  const cleanName = pokemon.name.toLowerCase().trim();
  let baseIngChance = SPECIES_BASE_ING_RATES[cleanName];
  if (!baseIngChance) {
    if (pokemon.specialty === 'Ingredientes') baseIngChance = 0.26;
    else if (pokemon.specialty === 'Bayas') baseIngChance = 0.15;
    else if (pokemon.specialty === 'Todo') baseIngChance = 0.22;
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
  let berriesPerHelp = pokemon.specialty === 'Bayas' ? 2 : 1;
  const hasBFS = pokemon.subskills.some(s => s.enabled && s.name === 'Busca bayas S');
  if (hasBFS) berriesPerHelp += 1;

  // 7. Dynamic Inventory & Sneaky Snacking calculation
  // Stage 1: ~12-14, Stage 2: ~16-18, Stage 3: ~20-24
  let baseInventory = 13;
  if (['gengar', 'blastoise', 'charizard', 'venusaur', 'raichu', 'typhlosion', 'feraligatr', 'meganium', 'ampharos', 'tyranitar', 'walrein', 'gardevoir', 'gallade', 'magnezone', 'togekiss', 'dragonite'].some(s => cleanName.includes(s))) {
    baseInventory = 20;
  } else if (['haunter', 'espeon', 'flareon', 'vaporeon', 'jolteon', 'umbreon', 'leafeon', 'glaceon', 'sylveon', 'flaaffy', 'quilava', 'croconaw', 'bayleef', 'ivysaur', 'wartortle', 'charmeleon', 'graveler', 'dugtrio', 'sealeo', 'kirlia', 'pupitar', 'togetic', 'dragonair'].some(s => cleanName.includes(s))) {
    baseInventory = 16;
  } else if (pokemon.specialty === 'Ingredientes') {
    baseInventory = 15;
  }

  let extraInventory = 0;
  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Inventario S') extraInventory += 6;
    if (sub.name === 'Inventario M') extraInventory += 12;
    if (sub.name === 'Inventario L') extraInventory += 18;
  }

  let totalInventory = baseInventory + extraInventory;
  if (config.goodCampTicket) {
    totalInventory = Math.round(totalInventory * 1.20);
  }

  // Average inventory slots filled per help:
  const avgItemsPerHelp = (1 - ingChance) * berriesPerHelp + ingChance * 2.2;
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

  const isFavorite = config.favoriteBerries.includes(pokemon.berry);
  const favoriteMultiplier = isFavorite ? 2.0 : 1.0;
  const singleBerryVigor = getBerryVigor(pokemon.berry, pokemon.level);

  const dailyBerryVigor = Math.round(totalBerryHelps * berriesPerHelp * singleBerryVigor * favoriteMultiplier);

  // 7. Ingredient production
  const activeIngSlots = pokemon.ingredients.filter(slot => slot.enabled);
  const dailyIngredients: Record<string, number> = {};

  if (activeIngSlots.length > 0) {
    const helpsPerSlot = totalIngHelps / activeIngSlots.length;

    for (const slot of activeIngSlots) {
      const produced = Math.round(helpsPerSlot * slot.count);
      dailyIngredients[slot.name] = (dailyIngredients[slot.name] || 0) + produced;
    }
  }

  // 9. Skill production
  let baseTriggerRate = pokemon.specialty === 'Habilidades' ? 0.042 : 0.024;
  let triggerMod = 1.0;
  for (const sub of pokemon.subskills) {
    if (!sub.enabled) continue;
    if (sub.name === 'Activación S') triggerMod *= 1.18;
    if (sub.name === 'Activación M') triggerMod *= 1.36;
  }
  triggerMod *= (pokemon.natureObj?.skillMod || 1.0);

  const skillTriggersPerDay = helpsPerDay * baseTriggerRate * triggerMod;
  const isHealer = ['jigglypuff', 'wigglytuff', 'pawmi', 'pawmo', 'pawmot', 'ralts', 'kirlia', 'gardevoir', 'sylveon'].some(
    h => pokemon.name.toLowerCase().includes(h)
  );

  let dailySkillVigor = 0;
  if (!isHealer) {
    const vigorPerTrigger = getSkillVigorPerTrigger(pokemon);
    dailySkillVigor = Math.round(skillTriggersPerDay * vigorPerTrigger);
  }

  return {
    pokemon,
    effectiveFrequency,
    helpsPerDay,
    dailyBerryVigor,
    dailyIngredients,
    dailySkillVigor,
    isHealer
  };
}

// Plan 3 meals strictly respecting:
// 1. potCapacity (a recipe CANNOT be cooked if total required ingredients > potCapacity)
// 2. dailyPool availability (a recipe CANNOT be cooked if the team has not produced enough ingredients)
// 3. Fallback to Curri Mixto / Ensalada Mixta / Zumo Mixto (base vigor = 0, only filler points)
export function planTeamMeals(
  dailyPool: Record<string, number>,
  config: SnorlaxConfig,
  partialTeamScale: number = 1.0
): { meals: MealPlan[]; totalCookingVigor: number } {
  const potCapacity = getEffectivePotCapacity(config);

  // STRICT RULE 1: Only recipes of the week's dish type whose total ingredients <= potCapacity
  const fittingRecipes = RECIPES.filter(r => {
    if (r.type !== config.dishType) return false;
    const requiredTotal = Object.values(r.ingredients).reduce((a, b) => a + b, 0);
    return requiredTotal <= potCapacity;
  });

  // Sort candidate recipes by base vigor descending
  fittingRecipes.sort((a, b) => b.baseVigor - a.baseVigor);

  // Expected multiplier for Extra Tasty (Riquísimo):
  // Mon-Sat: 10% chance of 2x (+100%) -> 1 + 0.10 * 1 = 1.10
  // Sun: 30% chance of 3x (+200%) -> 1 + 0.30 * 2 = 1.60
  const extraTastyMultiplier = config.isSunday ? 1.60 : 1.10;
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

  for (let i = 0; i < 3; i++) {
    let chosenRecipe: Recipe = MIXED_DISHES[config.dishType];
    let isRealRecipe = false;

    // Search for highest-vigor fitting recipe
    for (const recipe of fittingRecipes) {
      let canAfford = true;
      for (const [ing, needed] of Object.entries(recipe.ingredients)) {
        const avail = poolCopy[ing] || 0;
        const missing = needed - avail;
        if (missing > 0) {
          // If only 1-2 ingredients missing for a large recipe (e.g. 28/30 oil), bag buffer / magnet covers it!
          if (missing <= 2 && (avail / needed) >= 0.80) {
            continue;
          }
          canAfford = false;
          break;
        }
      }

      if (canAfford) {
        chosenRecipe = recipe;
        isRealRecipe = true;
        // Deduct recipe ingredients strictly from available pool
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

  // Step 2: Now that all 3 recipes have their ingredients reserved, poolCopy contains ONLY the true surplus!
  // Allocate true surplus fairly across the 3 meals:
  for (let i = 0; i < 3; i++) {
    const mealData = chosenMealRecipes[i];
    const { recipe: chosenRecipe, recipeLevel, recipeVigor, recipeIngCount } = mealData;

    // Free spaces in pot for filler
    let freeSpaces = Math.max(0, potCapacity - recipeIngCount);
    const fillerMap: Record<string, { count: number; unitVigor: number }> = {};
    const remainingMeals = 3 - i;

    // Get available surplus ingredients strictly from poolCopy, ordered by unit vigor descending
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

    // Pass 2: If there are still free spaces left in the pot, top off with best remaining surplus
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

    // If partial team, scale back the resulting meal vigor to the team's actual size
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

  return { meals, totalCookingVigor };
}

// Evaluate a full 5-pokemon team
export function evaluateTeam(team: Pokemon[], config: SnorlaxConfig): OptimizedTeamResult {
  const bonusAyudaCount = team.reduce(
    (acc, p) => acc + p.subskills.filter(s => s.enabled && s.name === 'Bonus ayuda').length,
    0
  );

  const { teamEnergyFactor, totalDailyHealedEnergy, hasEffectiveHealer } = calculateTeamEnergyFactor(team);

  const productions = team.map(p => calculatePokemonProduction(p, config, bonusAyudaCount, teamEnergyFactor));

  let berryVigorDaily = 0;
  let skillVigorDaily = 0;
  const dailyIngredientProduction: Record<string, number> = {};

  for (const prod of productions) {
    berryVigorDaily += prod.dailyBerryVigor;
    skillVigorDaily += prod.dailySkillVigor;

    for (const [ing, count] of Object.entries(prod.dailyIngredients)) {
      dailyIngredientProduction[ing] = (dailyIngredientProduction[ing] || 0) + count;
    }
  }

  // Progressive recipe scaling for partial teams during Beam Search:
  const partialTeamScale = team.length > 0 ? Math.min(1.0, team.length / 5) : 1.0;

  // Plan 3 meals strictly with Area Bonus and Extra Tasty
  const { meals, totalCookingVigor } = planTeamMeals(dailyIngredientProduction, config, partialTeamScale);

  // Apply Area Bonus to berries and skills
  const areaBonusMultiplier = 1 + (config.areaBonus || 0) / 100;
  const totalBerryVigorWithArea = Math.round(berryVigorDaily * areaBonusMultiplier);
  const totalSkillVigorWithArea = Math.round(skillVigorDaily * areaBonusMultiplier);

  const totalDailyVigor = totalBerryVigorWithArea + totalCookingVigor + totalSkillVigorWithArea;

  // Calculate optimization score according to chosen strategy
  let optimizationScore = totalDailyVigor;
  const realMeals = meals.filter(m => m.recipe.baseVigor > 0);
  if (config.strategy === 'cooking') {
    // Strongly prioritize completing real recipes that fit in the pot
    optimizationScore += realMeals.length * 15000;
  } else if (config.strategy === 'berries') {
    // Strongly prioritize favorite berry output
    optimizationScore += totalBerryVigorWithArea * 0.5;
  }

  // Build highlights
  const highlights: string[] = [];

  // Check Special Pokémon Limit (Official Sleep rule: Max 1 Legendary/Mythical per team)
  const specialPokemons = team.filter(p => isSpecialPokemon(p));
  if (specialPokemons.length > 1) {
    const specialNames = specialPokemons.map(p => p.name).join(', ');
    highlights.unshift(`⚠️ Excede límite de Legendarios: ${specialNames} (${specialPokemons.length}/1 permitidos).`);
    optimizationScore -= 100000;
  }

  const favoriteCount = team.filter(p => config.favoriteBerries.includes(p.berry)).length;
  if (favoriteCount > 0) {
    highlights.push(`${favoriteCount} Pokémon con Baya Favorita (×2 Vigor).`);
  }
  if (hasEffectiveHealer) {
    highlights.push(`Sanador activo (+${Math.round(totalDailyHealedEnergy)} energía/día, factor ${teamEnergyFactor.toFixed(2)}x).`);
  } else if (totalDailyHealedEnergy > 0) {
    highlights.push(`Sanador en desarrollo (+${Math.round(totalDailyHealedEnergy)} energía/día, factor ${teamEnergyFactor.toFixed(2)}x).`);
  }
  if (bonusAyudaCount > 0) {
    highlights.push(`Bonus Ayuda acumulado: -${Math.min(25, bonusAyudaCount * 5)}% tiempo de ayuda.`);
  }
  if (config.areaBonus && config.areaBonus > 0) {
    highlights.push(`Bonus de Zona: +${config.areaBonus}% vigor universal.`);
  }
  if (config.goodCampTicket) {
    const effPot = getEffectivePotCapacity(config);
    highlights.push(`🏕️ Pase de Acampada activo: Puchero expandido a ${effPot} ing. y +20% velocidad de ayuda.`);
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

// Heuristic score for ranking Pokemon
function getPokemonScore(pokemon: Pokemon, config: SnorlaxConfig, potCapacity: number): number {
  let score = 0;
  const isFavorite = config.favoriteBerries.includes(pokemon.berry);
  const berryVal = getBerryVigor(pokemon.berry, pokemon.level);
  const freq = Math.max(1200, pokemon.frequencySeconds);

  // 1. Berry Score
  let berries = pokemon.specialty === 'Bayas' ? 2 : 1;
  if (pokemon.subskills.some(s => s.enabled && s.name === 'Busca bayas S')) berries += 1;
  const dailyHelps = 86400 / freq;
  const berryDaily = dailyHelps * (isFavorite ? 2 : 1) * berryVal * berries * 0.75;
  score += berryDaily;

  // 2. Ingredient Score: check if ingredients match fitting recipes for this week's dish type
  const activeIngs = pokemon.ingredients.filter(i => i.enabled);
  let ingValuation = 0;
  const fittingRecipes = RECIPES.filter(
    r => r.type === config.dishType && Object.values(r.ingredients).reduce((a, b) => a + b, 0) <= potCapacity
  );

  for (const slot of activeIngs) {
    const unitVigor = INGREDIENTS[slot.name]?.vigor || 100;
    let matchBonus = 1.0;
    // If ingredient is used in a fitting recipe
    for (const r of fittingRecipes) {
      if (r.ingredients[slot.name]) {
        matchBonus += (r.baseVigor / 1000) * 0.3;
      }
    }
    ingValuation += slot.count * unitVigor * matchBonus;
  }

  if (pokemon.specialty === 'Ingredientes') {
    score += ingValuation * 25;
  } else {
    score += ingValuation * 8;
  }

  // 3. Healer / Skill bonus
  const isHealer = ['jigglypuff', 'wigglytuff', 'pawmi', 'pawmo', 'pawmot', 'ralts', 'kirlia', 'gardevoir', 'sylveon'].some(
    h => pokemon.name.toLowerCase().includes(h)
  );
  const skillLvl = getPokemonSkillLevel(pokemon);
  if (isHealer) {
    score += skillLvl * 3000;
  }
  if (pokemon.specialty === 'Habilidades' || pokemon.specialty === 'Todo') {
    const vigorPerTrigger = getSkillVigorPerTrigger(pokemon);
    score += vigorPerTrigger * 2.5;
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

  // Form a balanced candidate pool so Beam Search tests both top berry gatherers AND top ingredient gatherers:
  const scoredAll = allPokemons.map(p => ({
    pokemon: p,
    score: getPokemonScore(p, config, potCapacity)
  }));

  // Separate by specialty
  const berryMons = scoredAll.filter(x => x.pokemon.specialty === 'Bayas').sort((a, b) => b.score - a.score);
  const ingMons = scoredAll.filter(x => x.pokemon.specialty === 'Ingredientes').sort((a, b) => b.score - a.score);
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
  const healers = allPokemons.filter(p => {
    const name = p.name.toLowerCase();
    const skill = p.mainSkillName || getPokemonCanonicalSkill(p.name);
    return skill.includes('Energía para todos') ||
      ['jigglypuff', 'wigglytuff', 'igglybuff', 'pawmi', 'pawmo', 'pawmot', 'ralts', 'kirlia', 'gardevoir', 'sylveon'].some(h => name.includes(h));
  }).sort((a, b) => b.level - a.level);
  healers.slice(0, 4).forEach(addPokemon);

  // Bucket 3: Top 6 Skills / Support (Mew, Mewtwo, Pot Expander, Bonus Ayuda)
  skillMons.slice(0, 6).forEach(x => addPokemon(x.pokemon));

  // Bucket 4: CRITICAL INGREDIENT QUOTAS:
  // For each ingredient required by the week's fitting recipes, ensure the top 2 best producers in the user's box are included
  const requiredIngredients = new Set<string>();
  RECIPES
    .filter(r => r.type === config.dishType && Object.values(r.ingredients).reduce((a, b) => a + b, 0) <= potCapacity)
    .forEach(r => {
      Object.keys(r.ingredients).forEach(ing => requiredIngredients.add(ing));
    });

  for (const ing of requiredIngredients) {
    const producers = allPokemons
      .filter(p => p.ingredients.some(s => s.enabled && s.name === ing))
      .map(p => {
        const slot = p.ingredients.find(s => s.enabled && s.name === ing)!;
        const rate = (slot.count * 86400) / p.frequencySeconds;
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
        if (hasSpecial && isSpecialPokemon(candidate)) continue;

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

          // Official Sleep Rule: At most 1 Special / Legendary on swap
          if (isSpecialPokemon(candidate)) {
            const otherSpecials = currentTeam.filter((p, idx) => idx !== i && isSpecialPokemon(p));
            if (otherSpecials.length > 0) continue;
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
