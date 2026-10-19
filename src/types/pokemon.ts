export type Specialty = 'Bayas' | 'Ingredientes' | 'Habilidades' | 'Todo';

export type DishType = 'curry' | 'salad' | 'dessert';

export interface IngredientSlot {
  name: string;
  count: number;
  unlockLevel: 1 | 30 | 60;
  enabled: boolean;
}

export interface Subskill {
  name: string;
  tier: 'white' | 'blue' | 'gold';
  description: string;
  unlockLevel: 10 | 25 | 50 | 75 | 100;
  enabled: boolean;
}

export interface Nature {
  name: string;
  upStat?: string;
  downStat?: string;
  speedMod: number;    // e.g. 0.90 for speed+, 1.10 for speed-, 1.0 neutral
  ingMod: number;      // e.g. 1.20 for ing+, 0.80 for ing-, 1.0 neutral
  skillMod: number;    // e.g. 1.20 for skill+, 0.80 for skill-, 1.0 neutral
  energyMod: number;   // e.g. 1.20 for energy+, 0.80 for energy-, 1.0 neutral
  expMod: number;      // e.g. 1.18 for exp+, 0.82 for exp-, 1.0 neutral
}

export interface Pokemon {
  id: string;
  name: string;
  frequencyStr: string;
  frequencySeconds: number;
  level: number;
  rp: number;
  specialty: Specialty;
  nature: string;
  natureObj: Nature;
  berry: string;
  berryType: string;
  ingredients: IngredientSlot[];
  subskills: Subskill[];
  encounterDate?: string;
  sleepHours?: string;
  notes?: string;
  mainSkillName?: string;
  mainSkillLevel?: number;
  carryLimit?: number;
}

export interface Recipe {
  id: string;
  name: string;
  type: DishType;
  baseVigor: number;
  ingredients: Record<string, number>;
  description?: string;
}

export type OptimizerStrategy = 'balanced' | 'cooking' | 'berries';

export interface CurrentTeamConfig {
  pokemonIds: string[];
  teamName?: string;
  updatedAt?: string;
}

export interface MidWeekProgress {
  currentVigor: number;
  currentDayIdx: number; // 0=Lun ... 6=Dom
  updatedAt?: string;
  isCalibrated?: boolean;
}

export interface SnorlaxConfig {
  island: string;
  dishType: DishType;
  favoriteBerries: string[];
  potSize: number;
  isSunday: boolean;
  strategy?: OptimizerStrategy;
  recipeLevels: Record<string, number>;
  areaBonus?: number; // 0 to 75%
  goodCampTicket?: boolean; // Pase de Acampada (+50% puchero, +20% velocidad de ayuda, +20% inventario)
  currentTeam?: CurrentTeamConfig;
  midWeekProgress?: MidWeekProgress;
}

export interface MealPlan {
  mealIndex: number;
  mealName: 'Desayuno' | 'Comida' | 'Cena';
  recipe: Recipe;
  recipeLevel: number;
  recipeVigor: number;
  fillerIngredients: { name: string; count: number; unitVigor: number; totalVigor: number }[];
  fillerVigor: number;
  totalMealVigor: number;
}

export interface OptimizedTeamResult {
  team: Pokemon[];
  totalDailyVigor: number;
  optimizationScore?: number;
  berryVigorDaily: number;
  cookingVigorDaily: number;
  skillVigorDaily: number;
  meals: MealPlan[];
  highlights: string[];
  dailyIngredientProduction: Record<string, number>;
}
