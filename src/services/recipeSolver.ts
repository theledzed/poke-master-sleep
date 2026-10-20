import { DishType, Recipe } from '../types/pokemon';
import { RECIPES, INGREDIENTS, DISH_LEVEL_BONUS } from '../data/gameData';

export interface FillerItem {
  name: string;
  count: number;
  vigorPerUnit: number;
  totalVigor: number;
}

export interface SolvedRecipeResult {
  recipe: Recipe;
  craftable: boolean;
  recipeSize: number;
  level: number;
  levelBonusPercent: number;
  baseRecipeVigor: number;
  scaledRecipeVigor: number;
  fillerSlotsAvailable: number;
  fillerSlotsUsed: number;
  fillerItems: FillerItem[];
  fillerBaseVigor: number;
  fillerScaledVigor: number;
  totalVigor: number;
  ingredientsRequired: Array<{ name: string; required: number; available: number }>;
  missingIngredients?: Array<{ name: string; missing: number }>;
  totalMissingCount?: number;
}

export interface SolverOptions {
  inventory: Record<string, number>;
  potSize: number;
  dishType?: DishType | 'all';
  recipeLevels?: Record<string, number>;
  islandBonusPercent?: number; // e.g. 3 for +3%
}

/**
 * Solves and ranks all recipes craftable with the current ingredient stock,
 * and greedily fills the remaining pot slots with the highest-vigor ingredients.
 */
export function solveOptimalRecipes(options: SolverOptions): {
  craftable: SolvedRecipeResult[];
  almostCraftable: SolvedRecipeResult[];
  totalCraftableCount: number;
} {
  const {
    inventory,
    potSize,
    dishType = 'all',
    recipeLevels = {},
    islandBonusPercent = 0
  } = options;

  const islandMultiplier = 1 + (islandBonusPercent / 100);

  const craftableList: SolvedRecipeResult[] = [];
  const almostCraftableList: SolvedRecipeResult[] = [];

  for (const recipe of RECIPES) {
    if (dishType !== 'all' && recipe.type !== dishType) {
      continue;
    }

    const recipeSize = Object.values(recipe.ingredients).reduce((a, b) => a + b, 0);

    // If recipe is larger than the pot itself, it cannot be made
    if (recipeSize > potSize) {
      continue;
    }

    const recipeLvl = recipeLevels[recipe.name] || 1;
    const levelBonus = DISH_LEVEL_BONUS[recipeLvl] || 0;
    const recipeBonusMultiplier = (1 + levelBonus / 100) * islandMultiplier;

    let canCraft = true;
    let missingTotal = 0;
    const ingredientsReq: Array<{ name: string; required: number; available: number }> = [];
    const missingList: Array<{ name: string; missing: number }> = [];

    for (const [ingName, reqCount] of Object.entries(recipe.ingredients)) {
      const avail = inventory[ingName] || 0;
      ingredientsReq.push({
        name: ingName,
        required: reqCount,
        available: avail
      });

      if (avail < reqCount) {
        canCraft = false;
        const diff = reqCount - avail;
        missingTotal += diff;
        missingList.push({ name: ingName, missing: diff });
      }
    }

    const scaledRecipeVigor = Math.round(recipe.baseVigor * recipeBonusMultiplier);

    if (canCraft) {
      // 1. Calculate remaining inventory after consuming required ingredients
      const leftoverInventory: Record<string, number> = { ...inventory };
      for (const [ingName, reqCount] of Object.entries(recipe.ingredients)) {
        leftoverInventory[ingName] = Math.max(0, (leftoverInventory[ingName] || 0) - reqCount);
      }

      // 2. Greedy Pot Filling: sort leftover stock by ingredient unit vigor descending
      const sortedLeftovers = Object.entries(leftoverInventory)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => ({
          name,
          count,
          vigorPerUnit: INGREDIENTS[name]?.vigor || 90
        }))
        .sort((a, b) => b.vigorPerUnit - a.vigorPerUnit);

      let freeSlots = potSize - recipeSize;
      const fillerItems: FillerItem[] = [];
      let fillerBaseVigor = 0;

      for (const item of sortedLeftovers) {
        if (freeSlots <= 0) break;
        const take = Math.min(freeSlots, item.count);
        if (take > 0) {
          const itemVigor = take * item.vigorPerUnit;
          fillerItems.push({
            name: item.name,
            count: take,
            vigorPerUnit: item.vigorPerUnit,
            totalVigor: itemVigor
          });
          fillerBaseVigor += itemVigor;
          freeSlots -= take;
        }
      }

      const fillerSlotsUsed = (potSize - recipeSize) - freeSlots;
      // In Pokémon Sleep, filler ingredients also receive the recipe level bonus and island bonus
      const fillerScaledVigor = Math.round(fillerBaseVigor * recipeBonusMultiplier);
      const totalVigor = scaledRecipeVigor + fillerScaledVigor;

      craftableList.push({
        recipe,
        craftable: true,
        recipeSize,
        level: recipeLvl,
        levelBonusPercent: levelBonus,
        baseRecipeVigor: recipe.baseVigor,
        scaledRecipeVigor,
        fillerSlotsAvailable: potSize - recipeSize,
        fillerSlotsUsed,
        fillerItems,
        fillerBaseVigor,
        fillerScaledVigor,
        totalVigor,
        ingredientsRequired: ingredientsReq
      });
    } else if (missingTotal <= 5) {
      // Recipe is almost craftable (missing <= 5 total items)
      almostCraftableList.push({
        recipe,
        craftable: false,
        recipeSize,
        level: recipeLvl,
        levelBonusPercent: levelBonus,
        baseRecipeVigor: recipe.baseVigor,
        scaledRecipeVigor,
        fillerSlotsAvailable: Math.max(0, potSize - recipeSize),
        fillerSlotsUsed: 0,
        fillerItems: [],
        fillerBaseVigor: 0,
        fillerScaledVigor: 0,
        totalVigor: scaledRecipeVigor,
        ingredientsRequired: ingredientsReq,
        missingIngredients: missingList,
        totalMissingCount: missingTotal
      });
    }
  }

  // Sort craftable recipes by highest total vigor descending
  craftableList.sort((a, b) => b.totalVigor - a.totalVigor);

  // Sort almost craftable by fewest missing ingredients, then highest base vigor
  almostCraftableList.sort((a, b) => {
    if ((a.totalMissingCount || 0) !== (b.totalMissingCount || 0)) {
      return (a.totalMissingCount || 0) - (b.totalMissingCount || 0);
    }
    return b.recipe.baseVigor - a.recipe.baseVigor;
  });

  return {
    craftable: craftableList,
    almostCraftable: almostCraftableList,
    totalCraftableCount: craftableList.length
  };
}
