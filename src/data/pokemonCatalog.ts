import { Specialty } from '../types/pokemon';

export interface SpeciesCatalogEntry {
  name: string;
  specialty: Specialty;
  berry: string;
  mainSkill: string;
  ingredients: [string, string, string];
  frequencyStr: string;
}

/**
 * Catálogo maestro oficial de especies de Pokémon Sleep basado en WikiDex.
 * Incluye Especialidad (Bayas, Ingredientes, Habilidades, Todo), Baya por tipo,
 * Habilidad principal canónica y lista de ingredientes por niveles (1, 30 y 60).
 */
export const POKEMON_SPECIES_CATALOG: SpeciesCatalogEntry[] = [
  // ==========================================
  // ESPECIALIDAD: TODO (Mítico / Legendario)
  // ==========================================
  {
    name: 'Mew',
    specialty: 'Todo',
    berry: 'Baya Ango',
    mainSkill: 'Metrónomo',
    ingredients: ['Huevo Selecto', 'Hierba Picante', 'Manzana Selecta'],
    frequencyStr: '45 min 14s'
  },
  {
    name: 'Darkrai',
    specialty: 'Todo',
    berry: 'Baya Wiki',
    mainSkill: 'Mal Sueño',
    ingredients: ['Fiambre Vegetariano', 'Hierba Picante', 'Aceite Puro'],
    frequencyStr: '45 min 49s'
  },

  // ==========================================
  // ESPECIALIDAD: BAYAS (WikiDex Páginas 2 a 6)
  // ==========================================
  {
    name: 'Caterpie',
    specialty: 'Bayas',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Miel', 'Miel'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Metapod',
    specialty: 'Bayas',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Miel', 'Miel'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Butterfree',
    specialty: 'Bayas',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Miel', 'Miel'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Rattata',
    specialty: 'Bayas',
    berry: 'Baya Caquic',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Manzana Selecta'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Raticate',
    specialty: 'Bayas',
    berry: 'Baya Caquic',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Manzana Selecta'],
    frequencyStr: '48 min 20s'
  },
  {
    name: 'Ekans',
    specialty: 'Bayas',
    berry: 'Baya Atania',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Huevo Selecto', 'Fiambre Vegetariano'],
    frequencyStr: '1h 23min 20s'
  },
  {
    name: 'Arbok',
    specialty: 'Bayas',
    berry: 'Baya Atania',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Huevo Selecto', 'Fiambre Vegetariano'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Pikachu',
    specialty: 'Bayas',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Manzana Selecta', 'Manzana Selecta'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Pikachu (Halloween)',
    specialty: 'Bayas',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Cacao Relajante', 'Manzana Selecta'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Raichu',
    specialty: 'Bayas',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Jengibre', 'Manzana Selecta'],
    frequencyStr: '36 min 40s'
  },
  {
    name: 'Pichu',
    specialty: 'Bayas',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Manzana Selecta', 'Manzana Selecta'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Cleffa',
    specialty: 'Bayas',
    berry: 'Baya Meloc',
    mainSkill: 'Metrónomo',
    ingredients: ['Manzana Selecta', 'Soja Verdegal', 'Manzana Selecta'],
    frequencyStr: '1h 33min 20s'
  },
  {
    name: 'Clefairy',
    specialty: 'Bayas',
    berry: 'Baya Meloc',
    mainSkill: 'Metrónomo',
    ingredients: ['Manzana Selecta', 'Soja Verdegal', 'Manzana Selecta'],
    frequencyStr: '1h 3min 20s'
  },
  {
    name: 'Clefable',
    specialty: 'Bayas',
    berry: 'Baya Meloc',
    mainSkill: 'Metrónomo',
    ingredients: ['Manzana Selecta', 'Soja Verdegal', 'Manzana Selecta'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Vulpix',
    specialty: 'Bayas',
    berry: 'Baya Zanama',
    mainSkill: 'Bayamanía',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '1h 8min 20s'
  },
  {
    name: 'Ninetales',
    specialty: 'Bayas',
    berry: 'Baya Zanama',
    mainSkill: 'Bayamanía',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Vulpix de Alola',
    specialty: 'Bayas',
    berry: 'Baya Safre',
    mainSkill: 'Bayamanía',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '1h 8min 20s'
  },
  {
    name: 'Ninetales de Alola',
    specialty: 'Bayas',
    berry: 'Baya Safre',
    mainSkill: 'Bayamanía',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Mankey',
    specialty: 'Bayas',
    berry: 'Baya Zreza',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Seta Sabrosa', 'Fiambre Vegetariano'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Primeape',
    specialty: 'Bayas',
    berry: 'Baya Zreza',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Seta Sabrosa', 'Fiambre Vegetariano'],
    frequencyStr: '46min 40s'
  },
  {
    name: 'Doduo',
    specialty: 'Bayas',
    berry: 'Baya Plama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Cacao Relajante', 'Soja Verdegal'],
    frequencyStr: '58 min 20s'
  },
  {
    name: 'Dodrio',
    specialty: 'Bayas',
    berry: 'Baya Plama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Cacao Relajante', 'Soja Verdegal'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Onix',
    specialty: 'Bayas',
    berry: 'Baya Zidra',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Fiambre Vegetariano', 'Patata'],
    frequencyStr: '51 min 40s'
  },
  {
    name: 'Steelix',
    specialty: 'Bayas',
    berry: 'Baya Andano',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Fiambre Vegetariano', 'Patata'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Cubone',
    specialty: 'Bayas',
    berry: 'Baya Higog',
    mainSkill: 'Carga vigor S',
    ingredients: ['Jengibre', 'Cacao Relajante', 'Jengibre'],
    frequencyStr: '1h 18min 20s'
  },
  {
    name: 'Marowak',
    specialty: 'Bayas',
    berry: 'Baya Higog',
    mainSkill: 'Carga vigor S',
    ingredients: ['Jengibre', 'Cacao Relajante', 'Jengibre'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Chikorita',
    specialty: 'Bayas',
    berry: 'Baya Rudion',
    mainSkill: 'Carga vigor S',
    ingredients: ['Cacao Relajante', 'Miel', 'Puerro Grueso'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Bayleef',
    specialty: 'Bayas',
    berry: 'Baya Rudion',
    mainSkill: 'Carga vigor S',
    ingredients: ['Cacao Relajante', 'Miel', 'Puerro Grueso'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Meganium',
    specialty: 'Bayas',
    berry: 'Baya Rudion',
    mainSkill: 'Carga vigor S',
    ingredients: ['Cacao Relajante', 'Miel', 'Puerro Grueso'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Cyndaquil',
    specialty: 'Bayas',
    berry: 'Baya Zanama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Jengibre', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Quilava',
    specialty: 'Bayas',
    berry: 'Baya Zanama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Jengibre', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Typhlosion',
    specialty: 'Bayas',
    berry: 'Baya Zanama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Jengibre', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Totodile',
    specialty: 'Bayas',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Aceite Puro', 'Fiambre Vegetariano'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Croconaw',
    specialty: 'Bayas',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Aceite Puro', 'Fiambre Vegetariano'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Feraligatr',
    specialty: 'Bayas',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Aceite Puro', 'Fiambre Vegetariano'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Sneasel',
    specialty: 'Bayas',
    berry: 'Baya Wiki',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Aceite Puro'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Weavile',
    specialty: 'Bayas',
    berry: 'Baya Wiki',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Aceite Puro'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Houndour',
    specialty: 'Bayas',
    berry: 'Baya Wiki',
    mainSkill: 'Carga vigor S',
    ingredients: ['Hierba Picante', 'Jengibre', 'Hierba Picante'],
    frequencyStr: '1h 21min 40s'
  },
  {
    name: 'Houndoom',
    specialty: 'Bayas',
    berry: 'Baya Wiki',
    mainSkill: 'Carga vigor S',
    ingredients: ['Hierba Picante', 'Jengibre', 'Hierba Picante'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Slakoth',
    specialty: 'Bayas',
    berry: 'Baya Caquic',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Aceite Puro', 'Miel'],
    frequencyStr: '1h 23min 20s'
  },
  {
    name: 'Vigoroth',
    specialty: 'Bayas',
    berry: 'Baya Caquic',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Aceite Puro', 'Miel'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Slaking',
    specialty: 'Bayas',
    berry: 'Baya Caquic',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Aceite Puro', 'Miel'],
    frequencyStr: '58 min 20s'
  },
  {
    name: 'Swablu',
    specialty: 'Bayas',
    berry: 'Baya Plama',
    mainSkill: 'Carga energía S',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Huevo Selecto'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Altaria',
    specialty: 'Bayas',
    berry: 'Baya Rimoya',
    mainSkill: 'Carga energía S',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Huevo Selecto'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Shuppet',
    specialty: 'Bayas',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Jengibre', 'Aceite Puro'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Banette',
    specialty: 'Bayas',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Jengibre', 'Aceite Puro'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Spheal',
    specialty: 'Bayas',
    berry: 'Baya Safre',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Aceite Puro'],
    frequencyStr: '1h 40min 0s'
  },
  {
    name: 'Sealeo',
    specialty: 'Bayas',
    berry: 'Baya Safre',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Aceite Puro'],
    frequencyStr: '1h 6min 40s'
  },
  {
    name: 'Walrein',
    specialty: 'Bayas',
    berry: 'Baya Safre',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Aceite Puro'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Torchic',
    specialty: 'Bayas',
    berry: 'Baya Zanama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Jengibre', 'Manzana Selecta'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Combusken',
    specialty: 'Bayas',
    berry: 'Baya Zreza',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Jengibre', 'Manzana Selecta'],
    frequencyStr: '48 min 20s'
  },
  {
    name: 'Blaziken',
    specialty: 'Bayas',
    berry: 'Baya Zreza',
    mainSkill: 'Carga vigor S',
    ingredients: ['Manzana Selecta', 'Jengibre', 'Manzana Selecta'],
    frequencyStr: '38 min 20s'
  },
  {
    name: 'Mudkip',
    specialty: 'Bayas',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Hierba Picante', 'Fiambre Vegetariano'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Marshtomp',
    specialty: 'Bayas',
    berry: 'Baya Higog',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Hierba Picante', 'Fiambre Vegetariano'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Swampert',
    specialty: 'Bayas',
    berry: 'Baya Higog',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Hierba Picante', 'Fiambre Vegetariano'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Bagon',
    specialty: 'Bayas',
    berry: 'Baya Rimoya',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Shelgon',
    specialty: 'Bayas',
    berry: 'Baya Rimoya',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '58 min 20s'
  },
  {
    name: 'Salamence',
    specialty: 'Bayas',
    berry: 'Baya Rimoya',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Soja Verdegal'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Piplup',
    specialty: 'Bayas',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Huevo Selecto', 'Huevo Selecto', 'Huevo Selecto'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Prinplup',
    specialty: 'Bayas',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Huevo Selecto', 'Huevo Selecto', 'Huevo Selecto'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Empoleon',
    specialty: 'Bayas',
    berry: 'Baya Andano',
    mainSkill: 'Carga vigor S',
    ingredients: ['Huevo Selecto', 'Huevo Selecto', 'Huevo Selecto'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Munna',
    specialty: 'Bayas',
    berry: 'Baya Ango',
    mainSkill: 'Carga energía S',
    ingredients: ['Hierba Picante', 'Cacao Relajante', 'Hierba Picante'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Musharna',
    specialty: 'Bayas',
    berry: 'Baya Ango',
    mainSkill: 'Carga energía S',
    ingredients: ['Hierba Picante', 'Cacao Relajante', 'Hierba Picante'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Tyrunt',
    specialty: 'Bayas',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Huevo Selecto', 'Fiambre Vegetariano'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Tyrantrum',
    specialty: 'Bayas',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor S',
    ingredients: ['Fiambre Vegetariano', 'Huevo Selecto', 'Fiambre Vegetariano'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Tinkatink',
    specialty: 'Bayas',
    berry: 'Baya Meloc',
    mainSkill: 'Carga energía S',
    ingredients: ['Siestomate', 'Cacao Relajante', 'Siestomate'],
    frequencyStr: '1h 6min 40s'
  },
  {
    name: 'Tinkatuff',
    specialty: 'Bayas',
    berry: 'Baya Meloc',
    mainSkill: 'Carga energía S',
    ingredients: ['Siestomate', 'Cacao Relajante', 'Siestomate'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Tinkaton',
    specialty: 'Bayas',
    berry: 'Baya Andano',
    mainSkill: 'Carga energía S',
    ingredients: ['Siestomate', 'Cacao Relajante', 'Siestomate'],
    frequencyStr: '41 min 40s'
  },

  // ==========================================
  // ESPECIALIDAD: INGREDIENTES (WikiDex Páginas 6 a 12)
  // ==========================================
  {
    name: 'Bulbasaur',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Siestomate', 'Patata'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Ivysaur',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Siestomate', 'Patata'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Venusaur',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Siestomate', 'Patata'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Charmander',
    specialty: 'Ingredientes',
    berry: 'Baya Zanama',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Fiambre Vegetariano', 'Jengibre', 'Hierba Picante'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Charmeleon',
    specialty: 'Ingredientes',
    berry: 'Baya Zanama',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Fiambre Vegetariano', 'Jengibre', 'Hierba Picante'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Charizard',
    specialty: 'Ingredientes',
    berry: 'Baya Zanama',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Fiambre Vegetariano', 'Jengibre', 'Hierba Picante'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Squirtle',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Fiambre Vegetariano'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Wartortle',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Fiambre Vegetariano'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Blastoise',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Fiambre Vegetariano'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Diglett',
    specialty: 'Ingredientes',
    berry: 'Baya Higog',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Puerro Grueso', 'Soja Verdegal'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Dugtrio',
    specialty: 'Ingredientes',
    berry: 'Baya Higog',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Puerro Grueso', 'Soja Verdegal'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Bellsprout',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Patata', 'Puerro Grueso'],
    frequencyStr: '1h 16min 40s'
  },
  {
    name: 'Weepinbell',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Patata', 'Puerro Grueso'],
    frequencyStr: '58 min 20s'
  },
  {
    name: 'Victreebel',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Siestomate', 'Patata', 'Puerro Grueso'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Geodude',
    specialty: 'Ingredientes',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Patata', 'Seta Sabrosa'],
    frequencyStr: '1h 35min 0s'
  },
  {
    name: 'Graveler',
    specialty: 'Ingredientes',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Patata', 'Seta Sabrosa'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Golem',
    specialty: 'Ingredientes',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Patata', 'Seta Sabrosa'],
    frequencyStr: '51 min 40s'
  },
  {
    name: 'Farfetch\'d',
    specialty: 'Ingredientes',
    berry: 'Baya Plama',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Puerro Grueso', 'Fiambre Vegetariano', 'Jengibre'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Gastly',
    specialty: 'Ingredientes',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Hierba Picante', 'Seta Sabrosa', 'Aceite Puro'],
    frequencyStr: '1h 5min 0s'
  },
  {
    name: 'Haunter',
    specialty: 'Ingredientes',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Hierba Picante', 'Seta Sabrosa', 'Aceite Puro'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Gengar',
    specialty: 'Ingredientes',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Hierba Picante', 'Seta Sabrosa', 'Aceite Puro'],
    frequencyStr: '36 min 40s'
  },
  {
    name: 'Chansey',
    specialty: 'Ingredientes',
    berry: 'Baya Caquic',
    mainSkill: 'Energía para todos S',
    ingredients: ['Huevo Selecto', 'Patata', 'Miel'],
    frequencyStr: '1h 16min 40s'
  },
  {
    name: 'Blissey',
    specialty: 'Ingredientes',
    berry: 'Baya Caquic',
    mainSkill: 'Energía para todos S',
    ingredients: ['Huevo Selecto', 'Patata', 'Miel'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Happiny',
    specialty: 'Ingredientes',
    berry: 'Baya Caquic',
    mainSkill: 'Energía para todos S',
    ingredients: ['Huevo Selecto', 'Patata', 'Miel'],
    frequencyStr: '1h 28min 20s'
  },
  {
    name: 'Kangaskhan',
    specialty: 'Ingredientes',
    berry: 'Baya Caquic',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Jengibre', 'Patata', 'Soja Verdegal'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Mr. Mime',
    specialty: 'Ingredientes',
    berry: 'Baya Meloc',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Patata', 'Puerro Grueso'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Mime Jr.',
    specialty: 'Ingredientes',
    berry: 'Baya Meloc',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Patata', 'Puerro Grueso'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Pinsir',
    specialty: 'Ingredientes',
    berry: 'Baya Ziuela',
    mainSkill: 'Carga vigor S',
    ingredients: ['Miel', 'Manzana Selecta', 'Fiambre Vegetariano'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Ditto',
    specialty: 'Ingredientes',
    berry: 'Baya Caquic',
    mainSkill: 'Transformación (Copia habilidades)',
    ingredients: ['Aceite Puro', 'Puerro Grueso', 'Cola de Slowpoke'],
    frequencyStr: '58 min 20s'
  },
  {
    name: 'Dratini',
    specialty: 'Ingredientes',
    berry: 'Baya Drasi',
    mainSkill: 'Carga energía S',
    ingredients: ['Hierba Picante', 'Maíz Verdegal', 'Aceite Puro'],
    frequencyStr: '1h 23min 20s'
  },
  {
    name: 'Dragonair',
    specialty: 'Ingredientes',
    berry: 'Baya Drasi',
    mainSkill: 'Carga energía S',
    ingredients: ['Hierba Picante', 'Maíz Verdegal', 'Aceite Puro'],
    frequencyStr: '1h 3min 20s'
  },
  {
    name: 'Dragonite',
    specialty: 'Ingredientes',
    berry: 'Baya Drasi',
    mainSkill: 'Carga energía S',
    ingredients: ['Hierba Picante', 'Maíz Verdegal', 'Aceite Puro'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Wooper',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Carga energía S',
    ingredients: ['Seta Sabrosa', 'Patata', 'Fiambre Vegetariano'],
    frequencyStr: '1h 30min 0s'
  },
  {
    name: 'Quagsire',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Carga energía S',
    ingredients: ['Seta Sabrosa', 'Patata', 'Fiambre Vegetariano'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Wooper de Paldea',
    specialty: 'Ingredientes',
    berry: 'Baya Atania',
    mainSkill: 'Carga energía S',
    ingredients: ['Cacao Relajante', 'Café Estimulante', 'Patata'],
    frequencyStr: '1h 30min 0s'
  },
  {
    name: 'Clodsire',
    specialty: 'Ingredientes',
    berry: 'Baya Atania',
    mainSkill: 'Carga energía S',
    ingredients: ['Cacao Relajante', 'Café Estimulante', 'Patata'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Delibird',
    specialty: 'Ingredientes',
    berry: 'Baya Plama',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Huevo Selecto', 'Manzana Selecta', 'Cacao Relajante'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Larvitar',
    specialty: 'Ingredientes',
    berry: 'Baya Zidra',
    mainSkill: 'Carga energía S',
    ingredients: ['Jengibre', 'Soja Verdegal', 'Fiambre Vegetariano'],
    frequencyStr: '1h 20min 0s'
  },
  {
    name: 'Pupitar',
    specialty: 'Ingredientes',
    berry: 'Baya Zidra',
    mainSkill: 'Carga energía S',
    ingredients: ['Jengibre', 'Soja Verdegal', 'Fiambre Vegetariano'],
    frequencyStr: '1h 0min 0s'
  },
  {
    name: 'Tyranitar',
    specialty: 'Ingredientes',
    berry: 'Baya Wiki',
    mainSkill: 'Carga energía S',
    ingredients: ['Jengibre', 'Soja Verdegal', 'Fiambre Vegetariano'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Mawile',
    specialty: 'Ingredientes',
    berry: 'Baya Andano',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aceite Puro', 'Maíz Verdegal', 'Siestomate'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Aron',
    specialty: 'Ingredientes',
    berry: 'Baya Andano',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Fiambre Vegetariano', 'Café Estimulante', 'Soja Verdegal'],
    frequencyStr: '1h 20min 0s'
  },
  {
    name: 'Lairon',
    specialty: 'Ingredientes',
    berry: 'Baya Andano',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Fiambre Vegetariano', 'Café Estimulante', 'Soja Verdegal'],
    frequencyStr: '1h 0min 0s'
  },
  {
    name: 'Aggron',
    specialty: 'Ingredientes',
    berry: 'Baya Andano',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Fiambre Vegetariano', 'Café Estimulante', 'Soja Verdegal'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Absol',
    specialty: 'Ingredientes',
    berry: 'Baya Wiki',
    mainSkill: 'Carga energía S',
    ingredients: ['Cacao Relajante', 'Manzana Selecta', 'Seta Sabrosa'],
    frequencyStr: '51 min 40s'
  },
  {
    name: 'Trapinch',
    specialty: 'Ingredientes',
    berry: 'Baya Higog',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aguacate', 'Hierba Picante', 'Soja Verdegal'],
    frequencyStr: '1h 25min 0s'
  },
  {
    name: 'Vibrava',
    specialty: 'Ingredientes',
    berry: 'Baya Higog',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aguacate', 'Hierba Picante', 'Soja Verdegal'],
    frequencyStr: '1h 5min 0s'
  },
  {
    name: 'Flygon',
    specialty: 'Ingredientes',
    berry: 'Baya Higog',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Aguacate', 'Hierba Picante', 'Soja Verdegal'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Shinx',
    specialty: 'Ingredientes',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Aceite Puro', 'Café Estimulante'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Luxio',
    specialty: 'Ingredientes',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Aceite Puro', 'Café Estimulante'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Luxray',
    specialty: 'Ingredientes',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor S',
    ingredients: ['Siestomate', 'Aceite Puro', 'Café Estimulante'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Spiritomb',
    specialty: 'Ingredientes',
    berry: 'Baya Oram',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Seta Sabrosa', 'Calabaza Suculenta', 'Puerro Grueso'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Croagunk',
    specialty: 'Ingredientes',
    berry: 'Baya Atania',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Seta Sabrosa'],
    frequencyStr: '1h 31min 40s'
  },
  {
    name: 'Toxicroak',
    specialty: 'Ingredientes',
    berry: 'Baya Atania',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Fiambre Vegetariano', 'Seta Sabrosa'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Snover',
    specialty: 'Ingredientes',
    berry: 'Baya Safre',
    mainSkill: 'Carga energía S',
    ingredients: ['Siestomate', 'Huevo Selecto', 'Seta Sabrosa'],
    frequencyStr: '1h 33min 20s'
  },
  {
    name: 'Abomasnow',
    specialty: 'Ingredientes',
    berry: 'Baya Safre',
    mainSkill: 'Carga energía S',
    ingredients: ['Siestomate', 'Huevo Selecto', 'Seta Sabrosa'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Pumpkaboo',
    specialty: 'Ingredientes',
    berry: 'Baya Oram',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Calabaza Suculenta', 'Soja Verdegal', 'Patata'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Gourgeist',
    specialty: 'Ingredientes',
    berry: 'Baya Oram',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Calabaza Suculenta', 'Soja Verdegal', 'Patata'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Grubbin',
    specialty: 'Ingredientes',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Café Estimulante', 'Seta Sabrosa', 'Miel'],
    frequencyStr: '1h 20min 0s'
  },
  {
    name: 'Charjabug',
    specialty: 'Ingredientes',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Café Estimulante', 'Seta Sabrosa', 'Miel'],
    frequencyStr: '1h 0min 0s'
  },
  {
    name: 'Vikavolt',
    specialty: 'Ingredientes',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Café Estimulante', 'Seta Sabrosa', 'Miel'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Cutiefly',
    specialty: 'Ingredientes',
    berry: 'Baya Meloc',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Aceite Puro', 'Maíz Verdegal'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Ribombee',
    specialty: 'Ingredientes',
    berry: 'Baya Meloc',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Aceite Puro', 'Maíz Verdegal'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Stufful',
    specialty: 'Ingredientes',
    berry: 'Baya Zreza',
    mainSkill: 'Carga vigor S',
    ingredients: ['Maíz Verdegal', 'Fiambre Vegetariano', 'Huevo Selecto'],
    frequencyStr: '1h 16min 40s'
  },
  {
    name: 'Bewear',
    specialty: 'Ingredientes',
    berry: 'Baya Zreza',
    mainSkill: 'Carga vigor S',
    ingredients: ['Maíz Verdegal', 'Fiambre Vegetariano', 'Huevo Selecto'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Comfey',
    specialty: 'Ingredientes',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Maíz Verdegal', 'Jengibre', 'Cacao Relajante'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Drampa',
    specialty: 'Ingredientes',
    berry: 'Baya Drasi',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Soja Verdegal', 'Aguacate', 'Fiambre Vegetariano'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Cramorant',
    specialty: 'Ingredientes',
    berry: 'Baya Plama',
    mainSkill: 'Carga vigor S',
    ingredients: ['Aceite Puro', 'Patata', 'Huevo Selecto'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Sprigatito',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Patata', 'Leche Mu-mu', 'Jengibre'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Floragato',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Patata', 'Leche Mu-mu', 'Jengibre'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Meowscarada',
    specialty: 'Ingredientes',
    berry: 'Baya Rudion',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Patata', 'Leche Mu-mu', 'Jengibre'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Fuecoco',
    specialty: 'Ingredientes',
    berry: 'Baya Zanama',
    mainSkill: 'Carga energía S',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Crocalor',
    specialty: 'Ingredientes',
    berry: 'Baya Zanama',
    mainSkill: 'Carga energía S',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Skeledirge',
    specialty: 'Ingredientes',
    berry: 'Baya Zanama',
    mainSkill: 'Carga energía S',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Quaxly',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Puerro Grueso', 'Aceite Puro'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Quaxwell',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Puerro Grueso', 'Aceite Puro'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Quaquaval',
    specialty: 'Ingredientes',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Soja Verdegal', 'Puerro Grueso', 'Aceite Puro'],
    frequencyStr: '41 min 40s'
  },

  // ==========================================
  // ESPECIALIDAD: HABILIDADES (WikiDex Páginas 12 a 18)
  // ==========================================
  {
    name: 'Sandshrew',
    specialty: 'Habilidades',
    berry: 'Baya Higog',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Soja Verdegal', 'Hierba Picante', 'Soja Verdegal'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Sandslash',
    specialty: 'Habilidades',
    berry: 'Baya Higog',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Soja Verdegal', 'Hierba Picante', 'Soja Verdegal'],
    frequencyStr: '48 min 20s'
  },
  {
    name: 'Jigglypuff',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Miel', 'Aceite Puro', 'Miel'],
    frequencyStr: '1h 8min 20s'
  },
  {
    name: 'Wigglytuff',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Miel', 'Aceite Puro', 'Miel'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Igglybuff',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Miel', 'Aceite Puro', 'Miel'],
    frequencyStr: '1h 26min 40s'
  },
  {
    name: 'Meowth',
    specialty: 'Habilidades',
    berry: 'Baya Caquic',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Leche Mu-mu', 'Fiambre Vegetariano', 'Leche Mu-mu'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Persian',
    specialty: 'Habilidades',
    berry: 'Baya Caquic',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Leche Mu-mu', 'Fiambre Vegetariano', 'Leche Mu-mu'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Psyduck',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Cacao Relajante', 'Manzana Selecta', 'Cacao Relajante'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Golduck',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Carga vigor S',
    ingredients: ['Cacao Relajante', 'Manzana Selecta', 'Cacao Relajante'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Growlithe',
    specialty: 'Habilidades',
    berry: 'Baya Zanama',
    mainSkill: 'Superútil S',
    ingredients: ['Hierba Picante', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Arcanine',
    specialty: 'Habilidades',
    berry: 'Baya Zanama',
    mainSkill: 'Superútil S',
    ingredients: ['Hierba Picante', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Slowpoke',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Carga energía S',
    ingredients: ['Cacao Relajante', 'Cola de Slowpoke', 'Siestomate'],
    frequencyStr: '1h 33min 20s'
  },
  {
    name: 'Slowbro',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Carga energía S',
    ingredients: ['Cacao Relajante', 'Cola de Slowpoke', 'Siestomate'],
    frequencyStr: '1h 0min 0s'
  },
  {
    name: 'Slowking',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Carga energía S',
    ingredients: ['Cacao Relajante', 'Cola de Slowpoke', 'Siestomate'],
    frequencyStr: '48 min 20s'
  },
  {
    name: 'Magnemite',
    specialty: 'Habilidades',
    berry: 'Baya Andano',
    mainSkill: 'Receta sustanciosa S',
    ingredients: ['Aceite Puro', 'Hierba Picante', 'Aceite Puro'],
    frequencyStr: '1h 35min 0s'
  },
  {
    name: 'Magneton',
    specialty: 'Habilidades',
    berry: 'Baya Andano',
    mainSkill: 'Receta sustanciosa S',
    ingredients: ['Aceite Puro', 'Hierba Picante', 'Aceite Puro'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Magnezone',
    specialty: 'Habilidades',
    berry: 'Baya Andano',
    mainSkill: 'Receta sustanciosa S',
    ingredients: ['Aceite Puro', 'Hierba Picante', 'Aceite Puro'],
    frequencyStr: '48 min 20s'
  },
  {
    name: 'Eevee',
    specialty: 'Habilidades',
    berry: 'Baya Caquic',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Leche Mu-mu'],
    frequencyStr: '1h 1min 40s'
  },
  {
    name: 'Vaporeon',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Fiambre Vegetariano'],
    frequencyStr: '51 min 40s'
  },
  {
    name: 'Jolteon',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Superútil S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Manzana Selecta'],
    frequencyStr: '36 min 40s'
  },
  {
    name: 'Flareon',
    specialty: 'Habilidades',
    berry: 'Baya Zanama',
    mainSkill: 'Receta sustanciosa S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Hierba Picante'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Espeon',
    specialty: 'Habilidades',
    berry: 'Baya Ango',
    mainSkill: 'Carga vigor M',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Leche Mu-mu'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Umbreon',
    specialty: 'Habilidades',
    berry: 'Baya Wiki',
    mainSkill: 'Carga energía S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Leche Mu-mu'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Leafeon',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Carga energía S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Miel'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Glaceon',
    specialty: 'Habilidades',
    berry: 'Baya Safre',
    mainSkill: 'Receta sustanciosa S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Leche Mu-mu'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Sylveon',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Leche Mu-mu', 'Cacao Relajante', 'Leche Mu-mu'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Togepi',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Metrónomo',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Manzana Selecta'],
    frequencyStr: '1h 20min 0s'
  },
  {
    name: 'Togetic',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Metrónomo',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Manzana Selecta'],
    frequencyStr: '1h 5min 0s'
  },
  {
    name: 'Togekiss',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Metrónomo',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Manzana Selecta'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Mareep',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor M',
    ingredients: ['Hierba Picante', 'Huevo Selecto', 'Hierba Picante'],
    frequencyStr: '1h 16min 40s'
  },
  {
    name: 'Flaaffy',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor M',
    ingredients: ['Hierba Picante', 'Huevo Selecto', 'Hierba Picante'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Ampharos',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Carga vigor M',
    ingredients: ['Hierba Picante', 'Huevo Selecto', 'Hierba Picante'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Bonsly',
    specialty: 'Habilidades',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor M',
    ingredients: ['Siestomate', 'Seta Sabrosa', 'Siestomate'],
    frequencyStr: '1h 36min 40s'
  },
  {
    name: 'Sudowoodo',
    specialty: 'Habilidades',
    berry: 'Baya Zidra',
    mainSkill: 'Carga vigor M',
    ingredients: ['Siestomate', 'Seta Sabrosa', 'Siestomate'],
    frequencyStr: '1h 3min 20s'
  },
  {
    name: 'Wobbuffet',
    specialty: 'Habilidades',
    berry: 'Baya Ango',
    mainSkill: 'Carga energía S',
    ingredients: ['Manzana Selecta', 'Seta Sabrosa', 'Manzana Selecta'],
    frequencyStr: '58 min 20s'
  },
  {
    name: 'Wynaut',
    specialty: 'Habilidades',
    berry: 'Baya Ango',
    mainSkill: 'Carga energía S',
    ingredients: ['Manzana Selecta', 'Seta Sabrosa', 'Manzana Selecta'],
    frequencyStr: '1h 36min 40s'
  },
  {
    name: 'Heracross',
    specialty: 'Habilidades',
    berry: 'Baya Ziuela',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Miel', 'Seta Sabrosa', 'Fiambre Vegetariano'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Raikou',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Superútil S',
    ingredients: ['Fiambre Vegetariano', 'Manzana Selecta', 'Hierba Picante'],
    frequencyStr: '35 min 0s'
  },
  {
    name: 'Entei',
    specialty: 'Habilidades',
    berry: 'Baya Zanama',
    mainSkill: 'Superútil S',
    ingredients: ['Aceite Puro', 'Siestomate', 'Hierba Picante'],
    frequencyStr: '35 min 0s'
  },
  {
    name: 'Suicune',
    specialty: 'Habilidades',
    berry: 'Baya Aranja',
    mainSkill: 'Superútil S',
    ingredients: ['Manzana Selecta', 'Maíz Verdegal', 'Aceite Puro'],
    frequencyStr: '35 min 0s'
  },
  {
    name: 'Treecko',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Bayamanía',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Huevo Selecto'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Grovyle',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Bayamanía',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Huevo Selecto'],
    frequencyStr: '53 min 20s'
  },
  {
    name: 'Sceptile',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Bayamanía',
    ingredients: ['Huevo Selecto', 'Soja Verdegal', 'Huevo Selecto'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Ralts',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Manzana Selecta', 'Maíz Verdegal', 'Puerro Grueso'],
    frequencyStr: '1h 15min 0s'
  },
  {
    name: 'Kirlia',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Manzana Selecta', 'Maíz Verdegal', 'Puerro Grueso'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Gardevoir',
    specialty: 'Habilidades',
    berry: 'Baya Meloc',
    mainSkill: 'Energía para todos S',
    ingredients: ['Manzana Selecta', 'Maíz Verdegal', 'Puerro Grueso'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Gallade',
    specialty: 'Habilidades',
    berry: 'Baya Zreza',
    mainSkill: 'Superútil S',
    ingredients: ['Manzana Selecta', 'Maíz Verdegal', 'Puerro Grueso'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Sableye',
    specialty: 'Habilidades',
    berry: 'Baya Wiki',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Seta Sabrosa', 'Aceite Puro', 'Seta Sabrosa'],
    frequencyStr: '1h 3min 20s'
  },
  {
    name: 'Gulpin',
    specialty: 'Habilidades',
    berry: 'Baya Atania',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Seta Sabrosa', 'Siestomate', 'Seta Sabrosa'],
    frequencyStr: '1h 26min 40s'
  },
  {
    name: 'Swalot',
    specialty: 'Habilidades',
    berry: 'Baya Atania',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Seta Sabrosa', 'Siestomate', 'Seta Sabrosa'],
    frequencyStr: '56 min 40s'
  },
  {
    name: 'Turtwig',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Energía para todos S',
    ingredients: ['Siestomate', 'Patata', 'Miel'],
    frequencyStr: '1h 13min 20s'
  },
  {
    name: 'Grotle',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Energía para todos S',
    ingredients: ['Siestomate', 'Patata', 'Miel'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Torterra',
    specialty: 'Habilidades',
    berry: 'Baya Rudion',
    mainSkill: 'Energía para todos S',
    ingredients: ['Siestomate', 'Patata', 'Miel'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Chimchar',
    specialty: 'Habilidades',
    berry: 'Baya Zanama',
    mainSkill: 'Bayamanía',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '1h 11min 40s'
  },
  {
    name: 'Monferno',
    specialty: 'Habilidades',
    berry: 'Baya Zreza',
    mainSkill: 'Bayamanía',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Infernape',
    specialty: 'Habilidades',
    berry: 'Baya Zreza',
    mainSkill: 'Bayamanía',
    ingredients: ['Manzana Selecta', 'Fiambre Vegetariano', 'Hierba Picante'],
    frequencyStr: '38 min 20s'
  },
  {
    name: 'Drifloon',
    specialty: 'Habilidades',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Maíz Verdegal', 'Manzana Selecta', 'Soja Verdegal'],
    frequencyStr: '1h 10min 0s'
  },
  {
    name: 'Drifblim',
    specialty: 'Habilidades',
    berry: 'Baya Oram',
    mainSkill: 'Carga vigor S',
    ingredients: ['Maíz Verdegal', 'Manzana Selecta', 'Soja Verdegal'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Riolu',
    specialty: 'Habilidades',
    berry: 'Baya Zreza',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Aceite Puro', 'Patata', 'Huevo Selecto'],
    frequencyStr: '1h 8min 20s'
  },
  {
    name: 'Lucario',
    specialty: 'Habilidades',
    berry: 'Baya Andano',
    mainSkill: 'Imán fragmentos S',
    ingredients: ['Aceite Puro', 'Patata', 'Huevo Selecto'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Cresselia',
    specialty: 'Habilidades',
    berry: 'Baya Ango',
    mainSkill: 'Energía para todos S',
    ingredients: ['Leche Mu-mu', 'Huevo Selecto', 'Hierba Picante'],
    frequencyStr: '40 min 0s'
  },
  {
    name: 'Rufflet',
    specialty: 'Habilidades',
    berry: 'Baya Plama',
    mainSkill: 'Bayamanía',
    ingredients: ['Fiambre Vegetariano', 'Maíz Verdegal', 'Fiambre Vegetariano'],
    frequencyStr: '1h 1min 40s'
  },
  {
    name: 'Braviary',
    specialty: 'Habilidades',
    berry: 'Baya Plama',
    mainSkill: 'Bayamanía',
    ingredients: ['Fiambre Vegetariano', 'Maíz Verdegal', 'Fiambre Vegetariano'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Dedenne',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Manzana Selecta', 'Cacao Relajante', 'Manzana Selecta'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Noibat',
    specialty: 'Habilidades',
    berry: 'Baya Rimoya',
    mainSkill: 'Carga vigor M',
    ingredients: ['Manzana Selecta', 'Puerro Grueso', 'Manzana Selecta'],
    frequencyStr: '1h 16min 40s'
  },
  {
    name: 'Noivern',
    specialty: 'Habilidades',
    berry: 'Baya Rimoya',
    mainSkill: 'Carga vigor M',
    ingredients: ['Manzana Selecta', 'Puerro Grueso', 'Manzana Selecta'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Mimikyu',
    specialty: 'Habilidades',
    berry: 'Baya Oram',
    mainSkill: 'Bayamanía',
    ingredients: ['Manzana Selecta', 'Hierba Picante', 'Cacao Relajante'],
    frequencyStr: '43 min 20s'
  },
  {
    name: 'Pawmi',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Energía para todos S',
    ingredients: ['Cacao Relajante', 'Leche Mu-mu', 'Cacao Relajante'],
    frequencyStr: '1h 8min 20s'
  },
  {
    name: 'Pawmo',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Energía para todos S',
    ingredients: ['Cacao Relajante', 'Leche Mu-mu', 'Cacao Relajante'],
    frequencyStr: '55 min 0s'
  },
  {
    name: 'Pawmot',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Energía para todos S',
    ingredients: ['Cacao Relajante', 'Leche Mu-mu', 'Cacao Relajante'],
    frequencyStr: '41 min 40s'
  },
  {
    name: 'Mewtwo',
    specialty: 'Habilidades',
    berry: 'Baya Ango',
    mainSkill: 'Onda Mental',
    ingredients: ['Soja Verdegal', 'Maíz Verdegal', 'Aceite Puro'],
    frequencyStr: '36 min 11s'
  },
  {
    name: 'Dwebble',
    specialty: 'Habilidades',
    berry: 'Baya Ziuela',
    mainSkill: 'Ingrediente aleatorio S',
    ingredients: ['Aceite Puro', 'Patata Suave', 'Tomate Ronco'],
    frequencyStr: '1h 05min 0s'
  },
  {
    name: 'Crustle',
    specialty: 'Habilidades',
    berry: 'Baya Ziuela',
    mainSkill: 'Ingrediente aleatorio S',
    ingredients: ['Aceite Puro', 'Patata Suave', 'Tomate Ronco'],
    frequencyStr: '50 min 0s'
  },
  {
    name: 'Hawlucha',
    specialty: 'Habilidades',
    berry: 'Baya Zreza',
    mainSkill: 'Ingrediente aleatorio S',
    ingredients: ['Huevo Selecto', 'Manzana Selecta', 'Hierba Picante'],
    frequencyStr: '45 min 0s'
  },
  {
    name: 'Murkrow',
    specialty: 'Habilidades',
    berry: 'Baya Wiki',
    mainSkill: 'Afortunado (Ingrediente aleatorio S)',
    ingredients: ['Huevo Selecto', 'Hierba Picante', 'Puerro Grueso'],
    frequencyStr: '1h 08min 20s'
  },
  {
    name: 'Honchkrow',
    specialty: 'Habilidades',
    berry: 'Baya Wiki',
    mainSkill: 'Afortunado (Ingrediente aleatorio S)',
    ingredients: ['Huevo Selecto', 'Hierba Picante', 'Puerro Grueso'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Shuckle',
    specialty: 'Habilidades',
    berry: 'Baya Ziuela',
    mainSkill: 'Zumo de Baya (Energía para todos S)',
    ingredients: ['Miel Dulce', 'Manzana Selecta', 'Seta Sabrosa'],
    frequencyStr: '1h 23min 20s'
  },
  {
    name: 'Plusle',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Más (Imán ingredientes S)',
    ingredients: ['Manzana Selecta', 'Soja Verdegal', 'Leche Mu-mu'],
    frequencyStr: '51 min 40s'
  },
  {
    name: 'Minun',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Menos (Receta sustanciosa S)',
    ingredients: ['Manzana Selecta', 'Soja Verdegal', 'Leche Mu-mu'],
    frequencyStr: '51 min 40s'
  },
  {
    name: 'Latias',
    specialty: 'Habilidades',
    berry: 'Baya Drasi',
    mainSkill: 'Pulso Cura (Ánimo enérgico S)',
    ingredients: ['Miel Dulce', 'Cacao Relajante', 'Huevo Selecto'],
    frequencyStr: '36 min 40s'
  },
  {
    name: 'Latios',
    specialty: 'Habilidades',
    berry: 'Baya Drasi',
    mainSkill: 'Cometa Draco (Bayamanía)',
    ingredients: ['Hierba Picante', 'Maíz Verdegal', 'Seta Sabrosa'],
    frequencyStr: '36 min 40s'
  },
  {
    name: 'Togedemaru',
    specialty: 'Habilidades',
    berry: 'Baya Uvav',
    mainSkill: 'Moflete Estático (Ánimo enérgico S)',
    ingredients: ['Manzana Selecta', 'Jengibre Picante', 'Aceite Puro'],
    frequencyStr: '48 min 20s'
  },
  {
    name: "Farfetch'd",
    specialty: 'Ingredientes',
    berry: 'Baya Plama',
    mainSkill: 'Imán ingredientes S',
    ingredients: ['Puerro Grueso', 'Salchicha Gruesa', 'Jengibre Picante'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Mr. Mime',
    specialty: 'Ingredientes',
    berry: 'Baya Ango',
    mainSkill: 'Carga vigor S',
    ingredients: ['Tomate Ronco', 'Patata Suave', 'Puerro Grueso'],
    frequencyStr: '46 min 40s'
  },
  {
    name: 'Mime Jr.',
    specialty: 'Ingredientes',
    berry: 'Baya Ango',
    mainSkill: 'Carga vigor S',
    ingredients: ['Tomate Ronco', 'Patata Suave', 'Puerro Grueso'],
    frequencyStr: '1h 11min 40s'
  }
];

// Map species names (lowercase normalized) to catalog entry for instant lookup
const CATALOG_MAP = new Map<string, SpeciesCatalogEntry>();
for (const entry of POKEMON_SPECIES_CATALOG) {
  const key = entry.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!CATALOG_MAP.has(key)) {
    CATALOG_MAP.set(key, entry);
  }
}

/**
 * Busca un Pokémon en el catálogo oficial por coincidencia exacta o flexible.
 */
export function findSpeciesCatalogEntry(query: string): SpeciesCatalogEntry | undefined {
  if (!query) return undefined;
  const clean = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (CATALOG_MAP.has(clean)) {
    return CATALOG_MAP.get(clean);
  }
  for (const [key, entry] of CATALOG_MAP.entries()) {
    if (clean.includes(key) || key.includes(clean)) {
      return entry;
    }
  }
  return undefined;
}

/**
 * Filtra sugerencias en tiempo real para el autocompletado del nombre.
 */
export function searchSpeciesCatalog(query: string, limit = 8): SpeciesCatalogEntry[] {
  if (!query || !query.trim()) {
    return POKEMON_SPECIES_CATALOG.slice(0, limit);
  }
  const clean = query.toLowerCase().trim();
  const startsWithMatches: SpeciesCatalogEntry[] = [];
  const containsMatches: SpeciesCatalogEntry[] = [];

  for (const entry of POKEMON_SPECIES_CATALOG) {
    const entryClean = entry.name.toLowerCase();
    if (entryClean.startsWith(clean)) {
      startsWithMatches.push(entry);
    } else if (entryClean.includes(clean)) {
      containsMatches.push(entry);
    }
    if (startsWithMatches.length >= limit) break;
  }

  const combined = [...startsWithMatches, ...containsMatches];
  return combined.slice(0, limit);
}
