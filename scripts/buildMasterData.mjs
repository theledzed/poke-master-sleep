import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 1. Load raw datamined JSON
const rawPath = '/Users/cris/.gemini/antigravity/brain/2c99231a-acac-4cf5-9e07-4c4d45eaf93b/scratch/raw_pokemon.json';
const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

// 2. Dictionaries
const TYPE_TO_BERRY = {
  normal: 'Baya Caquic',
  fire: 'Baya Zanama',
  water: 'Baya Aranja',
  electric: 'Baya Uvav',
  grass: 'Baya Rudion',
  ice: 'Baya Safre',
  fighting: 'Baya Zreza',
  poison: 'Baya Atania',
  ground: 'Baya Higog',
  flying: 'Baya Plama',
  psychic: 'Baya Ango',
  bug: 'Baya Ziuela',
  rock: 'Baya Zidra',
  ghost: 'Baya Oram',
  dragon: 'Baya Yache',
  steel: 'Baya Andano',
  dark: 'Baya Wiki',
  fairy: 'Baya Meloc'
};

const SPECIALTY_MAP = {
  'Berries': 'Bayas',
  'Ingredients': 'Ingredientes',
  'Skills': 'Habilidades',
  'All': 'Todo',
  'unknown': 'Bayas'
};

const SKILL_MAP = {
  'Ingredient Magnet S': 'Imán ingredientes S',
  'Charge Strength S': 'Carga vigor S',
  'Charge Strength S (Random)': 'Carga vigor S',
  'Charge Strength M': 'Carga vigor M',
  'Dream Shard Magnet S': 'Imán fragmentos S',
  'Dream Shard Magnet S (Random)': 'Imán fragmentos S',
  'Energizing Cheer S': 'Ánimo enérgico S',
  'Energy For Everyone S': 'Energía para todos S',
  'Extra Helpful S': 'Superútil S',
  'Cooking Power Up S': 'Receta sustanciosa S',
  'Metronome': 'Metrónomo',
  'Tasty Chance S': 'Cocinitas S',
  'Helper Boost': 'Mejora de ayuda',
  'Moonlight (Charge Energy S)': 'Luz Lunar (Carga energía S)',
  'Berry Burst': 'Bayamanía',
  'Disguise (Berry Burst)': 'Disfraz (Bayamanía)',
  'Plus (Ingredient Magnet S)': 'Más (Imán ingredientes S)',
  'Minus (Cooking Power Up S)': 'Menos (Receta sustanciosa S)',
  'Heal Pulse (Energizing Cheer S)': 'Pulso Cura (Ánimo enérgico S)',
  'Draco Meteor (Berry Burst)': 'Cometa Draco (Bayamanía)',
  'Stockpile (Charge Strength S)': 'Reserva (Carga vigor S)',
  'Spit Up (Charge Strength S)': 'Escupir (Carga vigor S)',
  'Swallow (Charge Strength S)': 'Tragar (Carga vigor S)',
  'Lunar Prayer (Energy For Everyone S)': 'Plegaria Lunar (Energía para todos S)',
  'Nuzzle (Energizing Cheer S)': 'Moflete Estático (Ánimo enérgico S)',
  'Versatile': 'Metrónomo',
  'Bad Dreams': 'Mal Sueño'
};

const ING_MAP = {
  apple: 'Manzana Selecta',
  cacao: 'Cacao Relajante',
  coffee: 'Café Estimulante',
  corn: 'Maíz Verdegal',
  egg: 'Huevo Selecto',
  ginger: 'Jengibre',
  herb: 'Hierba Picante',
  honey: 'Miel',
  leek: 'Puerro Grueso',
  milk: 'Leche Mu-mu',
  mushroom: 'Seta Sabrosa',
  oil: 'Aceite Puro',
  potato: 'Patata',
  pumpkin: 'Calabaza Suculenta',
  sausage: 'Fiambre Vegetariano',
  soy: 'Soja Verdegal',
  tail: 'Cola de Slowpoke',
  tomato: 'Siestomate'
};

function formatFrequency(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}min ${s}s`;
  }
  return `${m} min ${s}s`;
}

// 3. Process every pokemon
const processedSpecies = [];

for (const p of rawData) {
  const specialty = SPECIALTY_MAP[p.specialty] || 'Bayas';
  const berryName = TYPE_TO_BERRY[p.type] || 'Baya Caquic';
  const mainSkill = SKILL_MAP[p.skill] || p.skill || 'Carga vigor S';
  
  const ing1Name = ING_MAP[p.ing1?.name] || p.ing1?.name || 'Manzana Selecta';
  const ing2Name = ING_MAP[p.ing2?.name] || p.ing2?.name || ing1Name;
  const ing3Name = ING_MAP[p.ing3?.name] || p.ing3?.name || ing2Name;

  const speciesEntry = {
    id: p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''),
    dexNumber: p.id,
    name: p.name,
    specialty: specialty,
    type: p.type,
    berry: berryName,
    mainSkill: mainSkill,
    baseFrequency: p.frequency,
    frequencyStr: formatFrequency(p.frequency),
    ingredientRate: Number(p.ingRate.toFixed(2)),
    skillRate: Number(p.skillRate.toFixed(2)),
    carryLimit: p.carryLimit,
    friendshipPoints: p.fp,
    evolutionCount: p.evolutionCount,
    evolutionLeft: p.evolutionLeft,
    isFullyEvolved: p.isFullyEvolved,
    sleepType: p.sleepType,
    ingredients: [ing1Name, ing2Name, ing3Name],
    ingredientSlots: {
      slot1: { name: ing1Name, c1: p.ing1?.c1 || 1, c2: p.ing1?.c2 || 2, c3: p.ing1?.c3 || 4 },
      slot2: { name: ing2Name, c2: p.ing2?.c2 || 2, c3: p.ing2?.c3 || 4 },
      slot3: { name: ing3Name, c3: p.ing3?.c3 || 4 }
    },
    avatarUrl: `/images/avatar/portrait/${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
  };

  processedSpecies.push(speciesEntry);
}

// Ensure Mew and Darkrai have 'Todo'
const mew = processedSpecies.find(s => s.name === 'Mew');
if (mew) {
  mew.specialty = 'Todo';
  mew.berry = 'Baya Ango';
  mew.mainSkill = 'Metrónomo';
}
const darkrai = processedSpecies.find(s => s.name === 'Darkrai');
if (darkrai) {
  darkrai.specialty = 'Todo';
  darkrai.berry = 'Baya Wiki';
  darkrai.mainSkill = 'Mal Sueño';
}

console.log(`Processed ${processedSpecies.length} species.`);

// 4. Output src/data/speciesMaster.ts
const speciesMasterTsContent = `import { Specialty } from '../types/pokemon';

export interface MasterSpecies {
  id: string;
  dexNumber: number;
  name: string;
  specialty: Specialty;
  type: string;
  berry: string;
  mainSkill: string;
  baseFrequency: number;
  frequencyStr: string;
  ingredientRate: number; // percentage (e.g. 25.7)
  skillRate: number;      // percentage (e.g. 1.9)
  carryLimit: number;
  friendshipPoints: number;
  evolutionCount: number;
  evolutionLeft: number;
  isFullyEvolved: boolean;
  sleepType: string;
  ingredients: [string, string, string];
  ingredientSlots: {
    slot1: { name: string; c1: number; c2: number; c3: number };
    slot2: { name: string; c2: number; c3: number };
    slot3: { name: string; c3: number };
  };
  avatarUrl: string;
}

export const SPECIES_MASTER_DATA: MasterSpecies[] = ${JSON.stringify(processedSpecies, null, 2)};

// Map for instant O(1) lookup by normalized name
const SPECIES_LOOKUP = new Map<string, MasterSpecies>();

for (const species of SPECIES_MASTER_DATA) {
  const normKey = species.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  SPECIES_LOOKUP.set(normKey, species);
  SPECIES_LOOKUP.set(species.id, species);
}

export function getSpeciesMasterData(query: string): MasterSpecies | undefined {
  if (!query) return undefined;
  const clean = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (SPECIES_LOOKUP.has(clean)) {
    return SPECIES_LOOKUP.get(clean);
  }
  for (const [key, entry] of SPECIES_LOOKUP.entries()) {
    if (clean.includes(key) || key.includes(clean)) {
      return entry;
    }
  }
  return undefined;
}
`;

fs.writeFileSync(path.join(projectRoot, 'src/data/speciesMaster.ts'), speciesMasterTsContent);
console.log('Created src/data/speciesMaster.ts');

// 5. Read INGREDIENTS, RECIPES, SUBSKILLS, NATURES from gameData.ts
const gameDataContent = fs.readFileSync(path.join(projectRoot, 'src/data/gameData.ts'), 'utf8');

// Parse INGREDIENTS
const INGREDIENTS_DATA = [
  { id: 'leek', name: 'Puerro Grueso', vigor: 185, aliases: ['puerro grueso', 'puerro'], icon: '/images/ingredient/leek.png' },
  { id: 'mushroom', name: 'Seta Sabrosa', vigor: 167, aliases: ['seta sabrosa', 'setas sabrosas', 'seta'], icon: '/images/ingredient/mushroom.png' },
  { id: 'egg', name: 'Huevo Selecto', vigor: 115, aliases: ['huevo selecto', 'huevo', 'huevos'], icon: '/images/ingredient/egg.png' },
  { id: 'potato', name: 'Patata', vigor: 124, aliases: ['patata', 'patata suave', 'patatas'], icon: '/images/ingredient/potato.png' },
  { id: 'apple', name: 'Manzana Selecta', vigor: 90, aliases: ['manzana selecta', 'manzana', 'manzanas'], icon: '/images/ingredient/apple.png' },
  { id: 'herb', name: 'Hierba Picante', vigor: 130, aliases: ['hierba picante', 'hierba', 'hierbas'], icon: '/images/ingredient/herb.png' },
  { id: 'sausage', name: 'Fiambre Vegetariano', vigor: 103, aliases: ['fiambre vegetariano', 'salchicha selecta', 'salchicha gruesa', 'salchicha'], icon: '/images/ingredient/sausage.png' },
  { id: 'milk', name: 'Leche Mu-mu', vigor: 98, aliases: ['leche mu-mu', 'leche', 'leche mumu'], icon: '/images/ingredient/milk.png' },
  { id: 'honey', name: 'Miel', vigor: 104, aliases: ['miel', 'miel dulce'], icon: '/images/ingredient/honey.png' },
  { id: 'oil', name: 'Aceite Puro', vigor: 121, aliases: ['aceite puro', 'aceite'], icon: '/images/ingredient/oil.png' },
  { id: 'ginger', name: 'Jengibre', vigor: 109, aliases: ['jengibre', 'jengibre picante'], icon: '/images/ingredient/ginger.png' },
  { id: 'tomato', name: 'Siestomate', vigor: 110, aliases: ['siestomate', 'tomate', 'tomate ronco', 'tomate jugoso'], icon: '/images/ingredient/tomato.png' },
  { id: 'cacao', name: 'Cacao Relajante', vigor: 151, aliases: ['cacao relajante', 'cacao'], icon: '/images/ingredient/cacao.png' },
  { id: 'tail', name: 'Cola de Slowpoke', vigor: 342, aliases: ['cola de slowpoke', 'cola suave', 'cola'], icon: '/images/ingredient/tail.png' },
  { id: 'soybean', name: 'Soja Verdegal', vigor: 100, aliases: ['soja verdegal', 'soja'], icon: '/images/ingredient/soybean.png' },
  { id: 'corn', name: 'Maíz Verdegal', vigor: 140, aliases: ['maíz verdegal', 'maiz verdegal', 'maíz', 'maiz'], icon: '/images/ingredient/corn.png' },
  { id: 'coffee', name: 'Café Estimulante', vigor: 153, aliases: ['café estimulante', 'cafe estimulante', 'café', 'cafe'], icon: '/images/ingredient/coffee.png' },
  { id: 'pumpkin', name: 'Calabaza Suculenta', vigor: 250, aliases: ['calabaza suculenta', 'calabaza'], icon: '/images/ingredient/pumpkin.png' }
];

// Extract RECIPES from gameData.ts
const recipesMatch = gameDataContent.match(/export const RECIPES: Recipe\[\] = (\[[\s\S]*?\n\];)/);
let recipesList = [];
if (recipesMatch) {
  try {
    const rawRecipesStr = recipesMatch[1].replace(/;\s*$/, '');
    recipesList = eval(`(${rawRecipesStr})`);
  } catch (e) {
    console.error('Failed to eval recipes:', e);
  }
}

// Subskills
const SUBSKILLS_DATA = [
  { id: 'bfs', name: 'Busca bayas S', tier: 'gold', effectType: 'berry_count', effectValue: 1.0, description: 'Aumenta en 1 el número de bayas que encuentra el Pokémon cada vez.' },
  { id: 'hb', name: 'Bonus ayuda', tier: 'gold', effectType: 'team_speed', effectValue: 0.05, description: 'Reduce un 5% el tiempo que tardan en ayudar los miembros del equipo.' },
  { id: 'sleep_exp', name: 'Bonus EXP al dormir', tier: 'gold', effectType: 'sleep_exp', effectValue: 0.14, description: 'Aumenta un 14% los puntos de experiencia que gana el equipo al dormir.' },
  { id: 'research_exp', name: 'Bonus EXP de estudio', tier: 'gold', effectType: 'research_exp', effectValue: 0.06, description: 'Aumenta un 6% la cantidad de EXP de estudio obtenidos.' },
  { id: 'shards', name: 'Bonus fragmentos sueños', tier: 'gold', effectType: 'shards', effectValue: 0.06, description: 'Aumenta un 6% los fragmentos de sueños obtenidos.' },
  { id: 'energy_rec', name: 'Bonus recupera energía', tier: 'gold', effectType: 'energy_recovery', effectValue: 0.14, description: 'Multiplica por 1,14 la energía que recupera el equipo al dormir.' },
  { id: 'skill_level_l', name: 'Nivel habilidad L', tier: 'gold', effectType: 'skill_level', effectValue: 3.0, description: 'Aumenta 3 niveles la habilidad principal de este Pokémon.' },
  
  { id: 'helping_speed_m', name: 'Velocidad ayuda M', tier: 'blue', effectType: 'speed', effectValue: 0.14, description: 'Reduce un 14% el tiempo que tarda en ayudar el Pokémon.' },
  { id: 'ing_finder_m', name: 'Más ingredientes M', tier: 'blue', effectType: 'ingredient_rate', effectValue: 0.36, description: 'Aumenta un 36% la probabilidad de encontrar ingredientes.' },
  { id: 'skill_trigger_m', name: 'Activación M', tier: 'blue', effectType: 'skill_trigger', effectValue: 0.36, description: 'Aumenta la probabilidad de que el Pokémon utilice su habilidad principal.' },
  { id: 'inventory_m', name: 'Inventario M', tier: 'blue', effectType: 'inventory', effectValue: 12.0, description: 'Aumenta en 12 el número de bayas e ingredientes que puede tener.' },
  { id: 'inventory_l', name: 'Inventario L', tier: 'blue', effectType: 'inventory', effectValue: 18.0, description: 'Aumenta en 18 el número de bayas e ingredientes que puede tener.' },
  { id: 'skill_level_m', name: 'Nivel habilidad M', tier: 'blue', effectType: 'skill_level', effectValue: 2.0, description: 'Aumenta 2 niveles la habilidad principal de este Pokémon.' },

  { id: 'helping_speed_s', name: 'Velocidad ayuda S', tier: 'white', effectType: 'speed', effectValue: 0.07, description: 'Reduce un 7% el tiempo que tarda en ayudar el Pokémon.' },
  { id: 'ing_finder_s', name: 'Más ingredientes S', tier: 'white', effectType: 'ingredient_rate', effectValue: 0.18, description: 'Aumenta un 18% la probabilidad de encontrar ingredientes.' },
  { id: 'skill_trigger_s', name: 'Activación S', tier: 'white', effectType: 'skill_trigger', effectValue: 0.18, description: 'Aumenta ligeramente la probabilidad de usar su habilidad principal.' },
  { id: 'inventory_s', name: 'Inventario S', tier: 'white', effectType: 'inventory', effectValue: 6.0, description: 'Aumenta en 6 el número de bayas e ingredientes que puede tener.' },
  { id: 'skill_level_s', name: 'Nivel habilidad S', tier: 'white', effectType: 'skill_level', effectValue: 1.0, description: 'Aumenta 1 nivel la habilidad principal de este Pokémon.' }
];

// Natures
const NATURES_DATA = [
  { name: 'Firme', up: 'Rapidez de ayuda', down: 'Buscar ingredientes', speed: 0.90, ing: 0.80, skill: 1.0, energy: 1.0, exp: 1.0 },
  { name: 'Huraña', up: 'Rapidez de ayuda', down: 'Recuperar energía', speed: 0.90, ing: 1.0, skill: 1.0, energy: 0.80, exp: 1.0 },
  { name: 'Pícara', up: 'Rapidez de ayuda', down: 'Activar habilidad', speed: 0.90, ing: 1.0, skill: 0.80, energy: 1.0, exp: 1.0 },
  { name: 'Audaz', up: 'Rapidez de ayuda', down: 'EXP ganada', speed: 0.90, ing: 1.0, skill: 1.0, energy: 1.0, exp: 0.82 },
  { name: 'Osada', up: 'Recuperar energía', down: 'Rapidez de ayuda', speed: 1.10, ing: 1.0, skill: 1.0, energy: 1.20, exp: 1.0 },
  { name: 'Modesta', up: 'Buscar ingredientes', down: 'Rapidez de ayuda', speed: 1.10, ing: 1.20, skill: 1.0, energy: 1.0, exp: 1.0 },
  { name: 'Serena', up: 'Activar habilidad', down: 'Rapidez de ayuda', speed: 1.10, ing: 1.0, skill: 1.20, energy: 1.0, exp: 1.0 },
  { name: 'Miedosa', up: 'EXP ganada', down: 'Rapidez de ayuda', speed: 1.10, ing: 1.0, skill: 1.0, energy: 1.0, exp: 1.18 },
  { name: 'Dócil', up: null, down: null, speed: 1.0, ing: 1.0, skill: 1.0, energy: 1.0, exp: 1.0 },
  { name: 'Afable', up: 'Buscar ingredientes', down: 'Recuperar energía', speed: 1.0, ing: 1.20, skill: 1.0, energy: 0.80, exp: 1.0 },
  { name: 'Amable', up: 'Activar habilidad', down: 'Recuperar energía', speed: 1.0, ing: 1.0, skill: 1.20, energy: 0.80, exp: 1.0 },
  { name: 'Activa', up: 'EXP ganada', down: 'Recuperar energía', speed: 1.0, ing: 1.0, skill: 1.0, energy: 0.80, exp: 1.18 },
  { name: 'Agitada', up: 'Recuperar energía', down: 'Buscar ingredientes', speed: 1.0, ing: 0.80, skill: 1.0, energy: 1.20, exp: 1.0 },
  { name: 'Tímida', up: null, down: null, speed: 1.0, ing: 1.0, skill: 1.0, energy: 1.0, exp: 1.0 },
  { name: 'Cauta', up: 'Activar habilidad', down: 'Buscar ingredientes', speed: 1.0, ing: 0.80, skill: 1.20, energy: 1.0, exp: 1.0 },
  { name: 'Alegre', up: 'EXP ganada', down: 'Buscar ingredientes', speed: 1.0, ing: 0.80, skill: 1.0, energy: 1.0, exp: 1.18 },
  { name: 'Floja', up: 'Recuperar energía', down: 'Activar habilidad', speed: 1.0, ing: 1.0, skill: 0.80, energy: 1.20, exp: 1.0 },
  { name: 'Alocada', up: 'Buscar ingredientes', down: 'Activar habilidad', speed: 1.0, ing: 1.20, skill: 0.80, energy: 1.0, exp: 1.0 },
  { name: 'Rara', up: null, down: null, speed: 1.0, ing: 1.0, skill: 1.0, energy: 1.0, exp: 1.0 },
  { name: 'Ingenua', up: 'EXP ganada', down: 'Activar habilidad', speed: 1.0, ing: 1.0, skill: 0.80, energy: 1.0, exp: 1.18 },
  { name: 'Plácida', up: 'Recuperar energía', down: 'EXP ganada', speed: 1.0, ing: 1.0, skill: 1.0, energy: 1.20, exp: 0.82 },
  { name: 'Mansa', up: 'Buscar ingredientes', down: 'EXP ganada', speed: 1.0, ing: 1.20, skill: 1.0, energy: 1.0, exp: 0.82 },
  { name: 'Grosera', up: 'Activar habilidad', down: 'EXP ganada', speed: 1.0, ing: 1.0, skill: 1.20, energy: 1.0, exp: 0.82 },
  { name: 'Seria', up: null, down: null, speed: 1.0, ing: 1.0, skill: 1.0, energy: 1.0, exp: 1.0 },
  { name: 'Fuerte', up: null, down: null, speed: 1.0, ing: 1.0, skill: 1.0, energy: 1.0, exp: 1.0 }
];

// 6. Generate supabase/seed_game_data.sql
const sqlLines = [];
sqlLines.push(`-- ==========================================================`);
sqlLines.push(`-- POKÉMON SLEEP MASTER: DDL & DATAMINED SEED DATA COMPLETO`);
sqlLines.push(`-- Ejecuta este script completo en el SQL Editor de Supabase`);
sqlLines.push(`-- ==========================================================`);
sqlLines.push(``);
sqlLines.push(`-- 0. LIMPIEZA PREVIA (Elimina tablas temporales y recrea limpiamente)`);
sqlLines.push(`DROP TABLE IF EXISTS pokemon_species CASCADE;`);
sqlLines.push(`DROP TABLE IF EXISTS ingredients CASCADE;`);
sqlLines.push(`DROP TABLE IF EXISTS recipes CASCADE;`);
sqlLines.push(`DROP TABLE IF EXISTS subskills CASCADE;`);
sqlLines.push(`DROP TABLE IF EXISTS natures CASCADE;`);
sqlLines.push(``);

// 1. pokemon_species
sqlLines.push(`-- 1. TABLA: pokemon_species`);
sqlLines.push(`CREATE TABLE IF NOT EXISTS pokemon_species (`);
sqlLines.push(`    id TEXT PRIMARY KEY,`);
sqlLines.push(`    dex_number INT NOT NULL,`);
sqlLines.push(`    name TEXT NOT NULL,`);
sqlLines.push(`    specialty TEXT NOT NULL CHECK (specialty IN ('Bayas', 'Ingredientes', 'Habilidades', 'Todo')),`);
sqlLines.push(`    type TEXT NOT NULL,`);
sqlLines.push(`    berry_name TEXT NOT NULL,`);
sqlLines.push(`    base_frequency INT NOT NULL,`);
sqlLines.push(`    frequency_str TEXT NOT NULL,`);
sqlLines.push(`    ingredient_rate NUMERIC(5,2) NOT NULL,`);
sqlLines.push(`    skill_rate NUMERIC(5,2) NOT NULL,`);
sqlLines.push(`    carry_limit INT NOT NULL,`);
sqlLines.push(`    friendship_points INT NOT NULL,`);
sqlLines.push(`    evolution_count INT NOT NULL DEFAULT 0,`);
sqlLines.push(`    evolution_left INT NOT NULL DEFAULT 0,`);
sqlLines.push(`    is_fully_evolved BOOLEAN NOT NULL DEFAULT FALSE,`);
sqlLines.push(`    main_skill TEXT NOT NULL,`);
sqlLines.push(`    ingredients_config JSONB NOT NULL,`);
sqlLines.push(`    avatar_url TEXT,`);
sqlLines.push(`    created_at TIMESTAMPTZ DEFAULT NOW()`);
sqlLines.push(`);`);
sqlLines.push(`ALTER TABLE pokemon_species ENABLE ROW LEVEL SECURITY;`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow public read pokemon_species" ON pokemon_species;`);
sqlLines.push(`CREATE POLICY "Allow public read pokemon_species" ON pokemon_species FOR SELECT USING (true);`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow anon write pokemon_species" ON pokemon_species;`);
sqlLines.push(`CREATE POLICY "Allow anon write pokemon_species" ON pokemon_species FOR ALL USING (true);`);
sqlLines.push(``);

// 2. ingredients
sqlLines.push(`-- 2. TABLA: ingredients`);
sqlLines.push(`CREATE TABLE IF NOT EXISTS ingredients (`);
sqlLines.push(`    id TEXT PRIMARY KEY,`);
sqlLines.push(`    name TEXT NOT NULL,`);
sqlLines.push(`    base_vigor INT NOT NULL,`);
sqlLines.push(`    icon_url TEXT,`);
sqlLines.push(`    aliases TEXT[] DEFAULT '{}'`);
sqlLines.push(`);`);
sqlLines.push(`ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow public read ingredients" ON ingredients;`);
sqlLines.push(`CREATE POLICY "Allow public read ingredients" ON ingredients FOR SELECT USING (true);`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow anon write ingredients" ON ingredients;`);
sqlLines.push(`CREATE POLICY "Allow anon write ingredients" ON ingredients FOR ALL USING (true);`);
sqlLines.push(``);

// 3. recipes
sqlLines.push(`-- 3. TABLA: recipes`);
sqlLines.push(`CREATE TABLE IF NOT EXISTS recipes (`);
sqlLines.push(`    id TEXT PRIMARY KEY,`);
sqlLines.push(`    name TEXT NOT NULL,`);
sqlLines.push(`    dish_type TEXT NOT NULL CHECK (dish_type IN ('curry', 'salad', 'dessert')),`);
sqlLines.push(`    base_vigor INT NOT NULL,`);
sqlLines.push(`    ingredients_required JSONB NOT NULL,`);
sqlLines.push(`    description TEXT`);
sqlLines.push(`);`);
sqlLines.push(`ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow public read recipes" ON recipes;`);
sqlLines.push(`CREATE POLICY "Allow public read recipes" ON recipes FOR SELECT USING (true);`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow anon write recipes" ON recipes;`);
sqlLines.push(`CREATE POLICY "Allow anon write recipes" ON recipes FOR ALL USING (true);`);
sqlLines.push(``);

// 4. subskills
sqlLines.push(`-- 4. TABLA: subskills`);
sqlLines.push(`CREATE TABLE IF NOT EXISTS subskills (`);
sqlLines.push(`    id TEXT PRIMARY KEY,`);
sqlLines.push(`    name TEXT NOT NULL,`);
sqlLines.push(`    tier TEXT NOT NULL CHECK (tier IN ('white', 'blue', 'gold')),`);
sqlLines.push(`    effect_type TEXT NOT NULL,`);
sqlLines.push(`    effect_value NUMERIC(6,3) NOT NULL,`);
sqlLines.push(`    description TEXT`);
sqlLines.push(`);`);
sqlLines.push(`ALTER TABLE subskills ENABLE ROW LEVEL SECURITY;`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow public read subskills" ON subskills;`);
sqlLines.push(`CREATE POLICY "Allow public read subskills" ON subskills FOR SELECT USING (true);`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow anon write subskills" ON subskills;`);
sqlLines.push(`CREATE POLICY "Allow anon write subskills" ON subskills FOR ALL USING (true);`);
sqlLines.push(``);

// 5. natures
sqlLines.push(`-- 5. TABLA: natures`);
sqlLines.push(`CREATE TABLE IF NOT EXISTS natures (`);
sqlLines.push(`    name TEXT PRIMARY KEY,`);
sqlLines.push(`    up_stat TEXT,`);
sqlLines.push(`    down_stat TEXT,`);
sqlLines.push(`    speed_mod NUMERIC(4,2) NOT NULL,`);
sqlLines.push(`    ing_mod NUMERIC(4,2) NOT NULL,`);
sqlLines.push(`    skill_mod NUMERIC(4,2) NOT NULL,`);
sqlLines.push(`    energy_mod NUMERIC(4,2) NOT NULL,`);
sqlLines.push(`    exp_mod NUMERIC(4,2) NOT NULL`);
sqlLines.push(`);`);
sqlLines.push(`ALTER TABLE natures ENABLE ROW LEVEL SECURITY;`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow public read natures" ON natures;`);
sqlLines.push(`CREATE POLICY "Allow public read natures" ON natures FOR SELECT USING (true);`);
sqlLines.push(`DROP POLICY IF EXISTS "Allow anon write natures" ON natures;`);
sqlLines.push(`CREATE POLICY "Allow anon write natures" ON natures FOR ALL USING (true);`);
sqlLines.push(``);

// SEED INGREDIENTS
sqlLines.push(`-- ==========================================`);
sqlLines.push(`-- INSERTS: INGREDIENTES (${INGREDIENTS_DATA.length})`);
sqlLines.push(`-- ==========================================`);
for (const ing of INGREDIENTS_DATA) {
  const aliasesArr = ing.aliases.map(a => `'${a.replace(/'/g, "''")}'`).join(',');
  sqlLines.push(`INSERT INTO ingredients (id, name, base_vigor, icon_url, aliases) VALUES ('${ing.id}', '${ing.name}', ${ing.vigor}, '${ing.icon}', ARRAY[${aliasesArr}]) ON CONFLICT (id) DO UPDATE SET base_vigor = EXCLUDED.base_vigor, icon_url = EXCLUDED.icon_url, aliases = EXCLUDED.aliases;`);
}
sqlLines.push(``);

// SEED RECIPES
sqlLines.push(`-- ==========================================`);
sqlLines.push(`-- INSERTS: RECETAS (${recipesList.length})`);
sqlLines.push(`-- ==========================================`);
for (const r of recipesList) {
  const ingJson = JSON.stringify(r.ingredients || {}).replace(/'/g, "''");
  const desc = (r.description || '').replace(/'/g, "''");
  sqlLines.push(`INSERT INTO recipes (id, name, dish_type, base_vigor, ingredients_required, description) VALUES ('${r.id}', '${r.name.replace(/'/g, "''")}', '${r.type}', ${r.baseVigor}, '${ingJson}', '${desc}') ON CONFLICT (id) DO UPDATE SET base_vigor = EXCLUDED.base_vigor, ingredients_required = EXCLUDED.ingredients_required, description = EXCLUDED.description;`);
}
sqlLines.push(``);

// SEED SUBSKILLS
sqlLines.push(`-- ==========================================`);
sqlLines.push(`-- INSERTS: SUBHABILIDADES (${SUBSKILLS_DATA.length})`);
sqlLines.push(`-- ==========================================`);
for (const sub of SUBSKILLS_DATA) {
  sqlLines.push(`INSERT INTO subskills (id, name, tier, effect_type, effect_value, description) VALUES ('${sub.id}', '${sub.name}', '${sub.tier}', '${sub.effectType}', ${sub.effectValue}, '${sub.description.replace(/'/g, "''")}') ON CONFLICT (id) DO UPDATE SET tier = EXCLUDED.tier, effect_type = EXCLUDED.effect_type, effect_value = EXCLUDED.effect_value, description = EXCLUDED.description;`);
}
sqlLines.push(``);

// SEED NATURES
sqlLines.push(`-- ==========================================`);
sqlLines.push(`-- INSERTS: NATURALEZAS (${NATURES_DATA.length})`);
sqlLines.push(`-- ==========================================`);
for (const n of NATURES_DATA) {
  const up = n.up ? `'${n.up}'` : 'NULL';
  const down = n.down ? `'${n.down}'` : 'NULL';
  sqlLines.push(`INSERT INTO natures (name, up_stat, down_stat, speed_mod, ing_mod, skill_mod, energy_mod, exp_mod) VALUES ('${n.name}', ${up}, ${down}, ${n.speed}, ${n.ing}, ${n.skill}, ${n.energy}, ${n.exp}) ON CONFLICT (name) DO UPDATE SET up_stat = EXCLUDED.up_stat, down_stat = EXCLUDED.down_stat, speed_mod = EXCLUDED.speed_mod, ing_mod = EXCLUDED.ing_mod, skill_mod = EXCLUDED.skill_mod, energy_mod = EXCLUDED.energy_mod, exp_mod = EXCLUDED.exp_mod;`);
}
sqlLines.push(``);

// SEED POKEMON SPECIES
sqlLines.push(`-- ==========================================`);
sqlLines.push(`-- INSERTS: ESPECIES (${processedSpecies.length}) CON TASAS EXACTAS DATAMINED`);
sqlLines.push(`-- ==========================================`);
for (const s of processedSpecies) {
  const jsonConfig = JSON.stringify({
    ingredients: s.ingredients,
    slots: s.ingredientSlots
  }).replace(/'/g, "''");
  
  const sql = `INSERT INTO pokemon_species (id, dex_number, name, specialty, type, berry_name, base_frequency, frequency_str, ingredient_rate, skill_rate, carry_limit, friendship_points, evolution_count, evolution_left, is_fully_evolved, main_skill, ingredients_config, avatar_url) VALUES ('${s.id}', ${s.dexNumber}, '${s.name.replace(/'/g, "''")}', '${s.specialty}', '${s.type}', '${s.berry}', ${s.baseFrequency}, '${s.frequencyStr}', ${s.ingredientRate}, ${s.skillRate}, ${s.carryLimit}, ${s.friendshipPoints}, ${s.evolutionCount}, ${s.evolutionLeft}, ${s.isFullyEvolved}, '${s.mainSkill.replace(/'/g, "''")}', '${jsonConfig}', '${s.avatarUrl}') ON CONFLICT (id) DO UPDATE SET base_frequency = EXCLUDED.base_frequency, ingredient_rate = EXCLUDED.ingredient_rate, skill_rate = EXCLUDED.skill_rate, carry_limit = EXCLUDED.carry_limit, main_skill = EXCLUDED.main_skill, ingredients_config = EXCLUDED.ingredients_config;`;
  sqlLines.push(sql);
}

fs.writeFileSync(path.join(projectRoot, 'supabase/seed_game_data.sql'), sqlLines.join('\n'));
console.log('Successfully updated supabase/seed_game_data.sql with all tables and seeds!');
