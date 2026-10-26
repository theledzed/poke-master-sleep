import { getSpeciesMasterData, SPECIES_MASTER_DATA } from '../data/speciesMaster';

// PokeAPI integration service for Pokemon Sleep Master

// Map Spanish/English species names to National Pokedex Number
export const POKEMON_DEX_MAP: Record<string, number> = {
  // Starters & Gen 1
  'bulbasaur': 1, 'ivysaur': 2, 'venusaur': 3,
  'charmander': 4, 'charmeleon': 5, 'charizard': 6,
  'squirtle': 7, 'wartortle': 8, 'blastoise': 9,
  'caterpie': 10, 'metapod': 11, 'butterfree': 12,
  'rattata': 19, 'raticate': 20,
  'ekans': 23, 'arbok': 24,
  'pikachu': 25, 'raichu': 26,
  'sandshrew': 27, 'sandslash': 28,
  'clefairy': 35, 'clefable': 36,
  'vulpix': 37, 'ninetales': 38,
  'jigglypuff': 39, 'wigglytuff': 40,
  'diglett': 50, 'dugtrio': 51,
  'meowth': 52, 'persian': 53,
  'psyduck': 54, 'golduck': 55,
  'mankey': 56, 'primeape': 57,
  'growlithe': 58, 'arcanine': 59,
  'bellsprout': 69, 'weepinbell': 70, 'victreebel': 71,
  'geodude': 74, 'graveler': 75, 'golem': 76,
  'slowpoke': 79, 'slowbro': 80, 'slowking': 199,
  'magnemite': 81, 'magneton': 82, 'magnezone': 462,
  'farfetchd': 83, "farfetch'd": 83,
  'doduo': 84, 'dodrio': 85,
  'gastly': 92, 'haunter': 93, 'gengar': 94,
  'onix': 95, 'steelix': 208,
  'cubone': 104, 'marowak': 105,
  'kangaskhan': 115,
  'mrmime': 122, 'mr. mime': 122, 'mr mime': 122, 'mr.mime': 122,
  'pinsir': 127,
  'magikarp': 129, 'gyarados': 130,
  'ditto': 132,
  'eevee': 133, 'vaporeon': 134, 'jolteon': 135, 'flareon': 136,
  'espeon': 196, 'umbreon': 197, 'leafeon': 470, 'glaceon': 471, 'sylveon': 700,
  'dratini': 147, 'dragonair': 148, 'dragonite': 149,
  'mewtwo': 150, 'mew': 151,

  // Gen 2
  'chikorita': 152, 'bayleef': 153, 'meganium': 154,
  'cyndaquil': 155, 'quilava': 156, 'typhlosion': 157,
  'totodile': 158, 'croconaw': 159, 'feraligatr': 160,
  'pichu': 172, 'cleffa': 173, 'igglybuff': 174, 'togepi': 175, 'togetic': 176, 'togekiss': 468,
  'natu': 177, 'xatu': 178,
  'mareep': 179, 'flaaffy': 180, 'ampharos': 181,
  'sudowoodo': 185,
  'wooper': 194, 'quagsire': 195,
  'murkrow': 198, 'honchkrow': 430,
  'misdreavus': 200, 'mismagius': 429,
  'wobbuffet': 202,
  'shuckle': 213,
  'heracross': 214,
  'sneasel': 215, 'weavile': 461,
  'delibird': 225,
  'houndour': 228, 'houndoom': 229,
  'larvitar': 246, 'pupitar': 247, 'tyranitar': 248,
  'raikou': 243, 'entei': 244, 'suicune': 245,

  // Gen 3
  'treecko': 252, 'grovyle': 253, 'sceptile': 254,
  'torchic': 255, 'combusken': 256, 'blaziken': 257,
  'mudkip': 258, 'marshtomp': 259, 'swampert': 260,
  'slakoth': 287, 'vigoroth': 288, 'slaking': 289,
  'sableye': 302,
  'mawile': 303,
  'aron': 304, 'lairon': 305, 'aggron': 306,
  'plusle': 311, 'minun': 312,
  'gulpin': 316, 'swalot': 317,
  'trapinch': 328, 'vibrava': 329, 'flygon': 330,
  'swablu': 333, 'altaria': 334,
  'shuppet': 353, 'banette': 354,
  'absor': 359, 'absol': 359,
  'wynaut': 360,
  'spheal': 363, 'sealeo': 364, 'walrein': 365,
  'bagon': 371, 'shelgon': 372, 'salamence': 373,
  'latias': 380, 'latios': 381,
  'gardevoir': 282, 'gallade': 475, 'ralts': 280, 'kirlia': 281,

  // Gen 4
  'turtwig': 387, 'grotle': 388, 'torterra': 389,
  'chimchar': 390, 'monferno': 391, 'infernape': 392,
  'piplup': 393, 'prinplup': 394, 'empoleon': 395,
  'shinx': 403, 'luxio': 404, 'luxray': 405,
  'drifloon': 425, 'drifblim': 426,
  'bonsly': 438, 'happiny': 440, 'chansey': 113, 'blissey': 242,
  'mimejr': 439, 'mime jr': 439, 'mime jr.': 439, 'mime.jr': 439,
  'spiritomb': 442,
  'riolu': 447, 'lucario': 448,
  'croagunk': 453, 'toxicroak': 454,
  'abomasnow': 460, 'snover': 459,
  'darkrai': 491, 'cresselia': 488,

  // Gen 5 & beyond
  'munna': 517, 'musharna': 518,
  'dwebble': 557, 'crustle': 558,
  'foongus': 590, 'amoonguss': 591,
  'rufflet': 627, 'braviary': 628,
  'tyrunt': 696, 'tyrantrum': 697,
  'hawlucha': 701, 'dedenne': 702,
  'pumpkaboo': 710, 'gourgeist': 711,
  'noibat': 714, 'noivern': 715,
  'grubbin': 736, 'charjabug': 737, 'vikavolt': 738,
  'cutiefly': 742, 'ribombee': 743,
  'stufful': 759, 'bewear': 760,
  'comfey': 764,
  'togedemaru': 777,
  'mimikyu': 778,
  'drampa': 780,
  'cramorant': 845,
  'toxel': 848, 'toxtricity': 849,

  // Gen 9 Paldea
  'sprigatito': 906, 'floragato': 907, 'meowscarada': 908,
  'fuecoco': 909, 'crocalor': 910, 'skeledirge': 911,
  'quaxly': 912, 'quaxwell': 913, 'quaquaval': 914,
  'pawmi': 921, 'pawmo': 922, 'pawmot': 923,
  'tinkatink': 957, 'tinkatuff': 958, 'tinkaton': 959,
  'cetoddle': 974, 'cetitan': 975,
  'clodsire': 980
};

export function getPokemonDexId(name: string): number | null {
  if (!name) return null;
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  // 1. Authoritative check in speciesMaster (contains all 252 Pokémon Sleep species)
  const master = getSpeciesMasterData(name);
  if (master?.dexNumber) {
    return master.dexNumber;
  }

  // 2. Direct static map
  if (POKEMON_DEX_MAP[clean]) {
    return POKEMON_DEX_MAP[clean];
  }

  // 3. Substring / alias check in POKEMON_DEX_MAP
  for (const [key, id] of Object.entries(POKEMON_DEX_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return id;
    }
  }

  return null;
}

export type SpriteStyle = 'showdown' | 'sleep' | 'sleep_full' | 'artwork' | 'home' | 'pixel';

// Official Pokemon Artwork & Sprites (Supports Shiny and Sleep Avatar & Full Body!)
export function getPokemonArtworkUrl(
  nameOrId: string | number,
  style: SpriteStyle = 'showdown',
  isShiny: boolean = false
): string {
  let dexId: number | null = null;
  let pokemonName = '';

  if (typeof nameOrId === 'number') {
    dexId = nameOrId;
    const found = SPECIES_MASTER_DATA.find(s => s.dexNumber === nameOrId);
    if (found) pokemonName = found.name;
  } else {
    pokemonName = nameOrId;
    dexId = getPokemonDexId(nameOrId);
  }

  const cleanName = pokemonName.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  // 1. Sleep Avatar Portrait (256x256 circular head bust)
  if (style === 'sleep') {
    if (cleanName) {
      return `/images/avatar/portrait/${cleanName}${isShiny ? '_shiny' : ''}.png`;
    }
  }

  // 2. Sleep Full Body Illustration (492x448 full body 2D artwork with shadow)
  if (style === 'sleep_full') {
    if (cleanName) {
      return `/images/pokemon/${cleanName}${isShiny ? '_shiny' : ''}.png`;
    }
  }

  // If dexId is missing, NEVER default to Pikachu (#25)!
  // Gracefully fallback to local Sleep avatar if available or empty string so onError triggers
  if (!dexId) {
    const cleanName = typeof nameOrId === 'string'
      ? nameOrId.toLowerCase().replace(/[^a-z0-9]/g, '')
      : '';
    if (cleanName) {
      return isShiny
        ? `/images/avatar/portrait/${cleanName}_shiny.png`
        : `/images/avatar/portrait/${cleanName}.png`;
    }
    return '';
  }

  switch (style) {
    case 'showdown':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${isShiny ? 'shiny/' : ''}${dexId}.gif`;
    case 'artwork':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShiny ? 'shiny/' : ''}${dexId}.png`;
    case 'home':
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${isShiny ? 'shiny/' : ''}${dexId}.png`;
    case 'pixel':
    default:
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${dexId}.png`;
  }
}

/**
 * Returns local high-res Pokémon Sleep avatar portrait if available, with Showdown animated GIF as fallback
 */
export function getPokemonAvatarUrl(name: string, isShiny: boolean = false): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (isShiny) {
    return `/images/avatar/portrait/${cleanName}_shiny.png`;
  }
  return `/images/avatar/portrait/${cleanName}.png`;
}

/**
 * Returns local official Pokémon Sleep full-body illustration (2D standing artwork with shadow)
 */
export function getPokemonFullBodyUrl(name: string, isShiny: boolean = false): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (isShiny) {
    return `/images/pokemon/${cleanName}_shiny.png`;
  }
  return `/images/pokemon/${cleanName}.png`;
}


// Map Pokemon Sleep Berries to Official PokeAPI Item Sprites
export const BERRY_ITEM_SPRITES: Record<string, string> = {
  'Baya Caquic': 'persim-berry',
  'Baya Zanama': 'leppa-berry',
  'Baya Aranja': 'oran-berry',
  'Baya Uvav': 'grepa-berry',
  'Baya Rudion': 'durin-berry',
  'Baya Safre': 'rawst-berry',
  'Baya Zreza': 'cheri-berry',
  'Baya Atania': 'chesto-berry',
  'Baya Higog': 'figy-berry',
  'Baya Plama': 'pamtre-berry',
  'Baya Ango': 'mago-berry',
  'Baya Zidra': 'sitrus-berry',
  'Baya Oram': 'bluk-berry',
  'Baya Wiki': 'wiki-berry',
  'Baya Andano': 'belue-berry',
  'Baya Meloc': 'pecha-berry',
  'Baya Rimoya': 'yache-berry',
  'Baya Drasi': 'yache-berry',
  'Baya Yache': 'yache-berry',
  'Baya Ziuela': 'lum-berry',
  'Baya Lum': 'lum-berry'
};

// Map Pokemon Sleep Berries to Local Official Sleep Assets (with PokeAPI fallback)
export const BERRY_LOCAL_ASSETS: Record<string, string> = {
  'caquic': 'persim', 'persim': 'persim', 'caqui': 'persim',
  'zanama': 'leppa', 'leppa': 'leppa',
  'aranja': 'oran', 'oran': 'oran',
  'uvav': 'grepa', 'grepa': 'grepa',
  'rudion': 'durin', 'durin': 'durin',
  'safre': 'rawst', 'rawst': 'rawst',
  'zreza': 'cheri', 'cheri': 'cheri',
  'atania': 'chesto', 'chesto': 'chesto',
  'higog': 'figy', 'figy': 'figy',
  'plama': 'pamtre', 'pamtre': 'pamtre',
  'ango': 'mago', 'mago': 'mago',
  'zidra': 'sitrus', 'sitrus': 'sitrus',
  'oram': 'bluk', 'bluk': 'bluk',
  'wiki': 'wiki',
  'andano': 'belue', 'belue': 'belue',
  'meloc': 'pecha', 'pecha': 'pecha',
  'rimoya': 'yache', 'drasi': 'yache', 'yache': 'yache',
  'ziuela': 'lum', 'lum': 'lum'
};

export function getBerrySpriteUrl(berryName: string): string {
  if (!berryName) return '/images/berries/oran.png';
  const clean = berryName.toLowerCase().replace(/baya/g, '').trim();
  
  if (BERRY_LOCAL_ASSETS[clean]) {
    return `/images/berries/${BERRY_LOCAL_ASSETS[clean]}.png`;
  }
  for (const [key, slug] of Object.entries(BERRY_LOCAL_ASSETS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return `/images/berries/${slug}.png`;
    }
  }
  const itemSlug = BERRY_ITEM_SPRITES[berryName] || 'oran-berry';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemSlug}.png`;
}

// Map Pokemon Sleep Ingredients to Local Official Sleep Assets (Comprehensive aliases in Spanish and English)
export const INGREDIENT_LOCAL_ASSETS: Record<string, string> = {
  // Aceite Puro (Pure Oil)
  'aceite puro': 'oil',
  'aceite': 'oil',
  'pure oil': 'oil',
  'oil': 'oil',
  'aceite puro de oliva': 'oil',

  // Leche Mu-mu (Moomoo Milk)
  'leche mu-mu': 'milk',
  'leche mu mu': 'milk',
  'leche mumu': 'milk',
  'leche': 'milk',
  'moomoo milk': 'milk',
  'milk': 'milk',

  // Miel (Honey)
  'miel': 'honey',
  'honey': 'honey',

  // Cola de Slowpoke (Slowpoke Tail)
  'cola de slowpoke': 'tail',
  'cola slowpoke': 'tail',
  'cola': 'tail',
  'slowpoke tail': 'tail',
  'tail': 'tail',

  // Seta Sabrosa (Tasty Mushroom)
  'seta sabrosa': 'mushroom',
  'seta': 'mushroom',
  'tasty mushroom': 'mushroom',
  'mushroom': 'mushroom',

  // Huevo Selecto (Fancy Egg)
  'huevo selecto': 'egg',
  'huevo': 'egg',
  'fancy egg': 'egg',
  'egg': 'egg',

  // Manzana Selecta (Fancy Apple)
  'manzana selecta': 'apple',
  'manzana': 'apple',
  'fancy apple': 'apple',
  'apple': 'apple',

  // Hierba Picante (Fiery Herb)
  'hierba picante': 'herb',
  'hierba': 'herb',
  'fiery herb': 'herb',
  'herb': 'herb',

  // Patata / Patata Suave (Soft Potato)
  'patata': 'potato',
  'patata suave': 'potato',
  'papa': 'potato',
  'soft potato': 'potato',
  'potato': 'potato',

  // Soja Verdegal (Greengrass Soybeans)
  'soja verdegal': 'soybean',
  'soja': 'soybean',
  'soya': 'soybean',
  'greengrass soybeans': 'soybean',
  'soybeans': 'soybean',
  'soybean': 'soybean',

  // Fiambre Vegetariano (Bean Sausage)
  'fiambre vegetariano': 'sausage',
  'fiambre': 'sausage',
  'salchicha': 'sausage',
  'bean sausage': 'sausage',
  'sausage': 'sausage',

  // Cacao Relajante (Snoozy Cacao)
  'cacao relajante': 'cacao',
  'cacao': 'cacao',
  'snoozy cacao': 'cacao',

  // Café Estimulante (Rousing Coffee)
  'café estimulante': 'coffee',
  'cafe estimulante': 'coffee',
  'café': 'coffee',
  'cafe': 'coffee',
  'rousing coffee': 'coffee',
  'coffee': 'coffee',

  // Maíz Verdegal (Greengrass Corn)
  'maíz verdegal': 'corn',
  'maiz verdegal': 'corn',
  'maíz': 'corn',
  'maiz': 'corn',
  'greengrass corn': 'corn',
  'corn': 'corn',

  // Calabaza Suculenta (Pumpkin)
  'calabaza suculenta': 'pumpkin',
  'calabaza': 'pumpkin',
  'pumpkin': 'pumpkin',

  // Puerro Grueso (Large Leek)
  'puerro grueso': 'leek',
  'puerro': 'leek',
  'large leek': 'leek',
  'leek': 'leek',

  // Jengibre / Jengibre Picante (Warming Ginger)
  'jengibre': 'ginger',
  'jengibre picante': 'ginger',
  'warming ginger': 'ginger',
  'ginger': 'ginger',

  // Siestomate / Tomate Ronco (Snoozy Tomato)
  'siestomate': 'tomato',
  'tomate ronco': 'tomato',
  'tomate': 'tomato',
  'snoozy tomato': 'tomato',
  'tomato': 'tomato'
};

// Map Pokemon Sleep Ingredients to Official PokeAPI Item Sprites (fallback)
export const INGREDIENT_ITEM_SPRITES: Record<string, string> = {
  'Leche Mu-mu': 'moomoo-milk',
  'Miel': 'honey',
  'Cola de Slowpoke': 'slowpoke-tail',
  'Seta Sabrosa': 'big-mushroom',
  'Huevo Selecto': 'lucky-egg',
  'Manzana Selecta': 'sweet-apple',
  'Hierba Picante': 'revival-herb',
  'Patata': 'tart-apple',
  'Soja Verdegal': 'miracle-seed',
  'Fiambre Vegetariano': 'leftovers',
  'Aceite Puro': 'potion',
  'Cacao Relajante': 'rage-candy-bar',
  'Café Estimulante': 'soda-pop',
  'Maíz Verdegal': 'sweet-heart',
  'Calabaza Suculenta': 'aspear-berry',
  'Puerro Grueso': 'energy-root',
  'Jengibre': 'fresh-water',
  'Siestomate': 'tamato-berry',
  'Aguacate': 'qualot-berry'
};

export function getIngredientSpriteUrl(ingName: string): string {
  if (!ingName) return '/images/ingredient/oil.png';
  const clean = ingName.toLowerCase().trim();

  // 1. Direct local assets alias map
  if (INGREDIENT_LOCAL_ASSETS[clean]) {
    return `/images/ingredient/${INGREDIENT_LOCAL_ASSETS[clean]}.png`;
  }

  // 2. Substring matching for flexible keyword detection
  for (const [key, slug] of Object.entries(INGREDIENT_LOCAL_ASSETS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return `/images/ingredient/${slug}.png`;
    }
  }

  // 3. Fallback to PokeAPI item sprites if custom item
  const itemSlug = INGREDIENT_ITEM_SPRITES[ingName] || 'potion';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemSlug}.png`;
}

// Main skill icons and metadata
export interface MainSkillMeta {
  name: string;
  badgeBg: string;
  badgeText: string;
  iconSymbol: string;
  iconUrl?: string;
  category: 'energy' | 'vigor' | 'ingredients' | 'pot' | 'special';
}

/**
 * Returns the official high-res Pokemon Sleep main skill icon asset
 */
export function getMainSkillIconUrl(skillName: string): string {
  if (!skillName) return '/images/mainskill/strength.png';
  const clean = skillName.toLowerCase();
  if (clean.includes('metr')) return '/images/mainskill/metronome.png';
  if (clean.includes('vigor') || clean.includes('strength')) return '/images/mainskill/strength.png';
  if (clean.includes('reserva') || clean.includes('stockpile') || clean.includes('escupir') || clean.includes('tragar')) return '/images/mainskill/stockpile_strength.png';
  if (clean.includes('baya') || clean.includes('berry') || clean.includes('draco') || clean.includes('disfraz')) return '/images/mainskill/berries.png';
  if (clean.includes('pot') || clean.includes('receta') || clean.includes('cocina') || clean.includes('cooking') || clean.includes('menos (receta')) return '/images/mainskill/pot.png';
  if (clean.includes('chance') || clean.includes('cocinitas') || clean.includes('tasty')) return '/images/mainskill/chance.png';
  if (clean.includes('ingrediente') || clean.includes('ingredient') || clean.includes('afortunado') || clean.includes('más (imán') || clean.includes('magnet') || clean.includes('draw')) return '/images/mainskill/ingredient_draw.png';
  if (clean.includes('fragmento') || clean.includes('shard') || clean.includes('aura sphere')) return '/images/mainskill/shards.png';
  if (clean.includes('copia') || clean.includes('mimic') || clean.includes('copy') || clean.includes('transform')) return '/images/mainskill/copy.png';
  if (clean.includes('ayuda') || clean.includes('superútil') || clean.includes('help') || clean.includes('boost')) return '/images/mainskill/helps.png';
  if (clean.includes('energ') || clean.includes('ánimo') || clean.includes('cheer') || clean.includes('cura') || clean.includes('lunar') || clean.includes('zumo') || clean.includes('moflete') || clean.includes('autocuraci')) return '/images/mainskill/energy.png';
  if (clean.includes('onda') || clean.includes('sueño') || clean.includes('mind') || clean.includes('versat') || clean.includes('darkrai')) return '/images/mainskill/versatile.png';
  return '/images/mainskill/strength.png';
}

export const MAIN_SKILLS_META: Record<string, MainSkillMeta> = {
  'Energía para todos S': {
    name: 'Energía para todos S',
    badgeBg: 'bg-emerald-500/20 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    iconSymbol: '💖',
    category: 'energy'
  },
  'Carga vigor M': {
    name: 'Carga vigor M',
    badgeBg: 'bg-sky-500/20 border-sky-400/40',
    badgeText: 'text-sky-300',
    iconSymbol: '⚡',
    category: 'vigor'
  },
  'Carga vigor S': {
    name: 'Carga vigor S',
    badgeBg: 'bg-sky-500/15 border-sky-400/30',
    badgeText: 'text-sky-300',
    iconSymbol: '⚡',
    category: 'vigor'
  },
  'Carga energía S': {
    name: 'Carga energía S',
    badgeBg: 'bg-green-500/20 border-green-500/40',
    badgeText: 'text-green-300',
    iconSymbol: '🔋',
    category: 'energy'
  },
  'Cura de energía S': {
    name: 'Cura de energía S',
    badgeBg: 'bg-teal-500/20 border-teal-500/40',
    badgeText: 'text-teal-300',
    iconSymbol: '🌿',
    category: 'energy'
  },
  'Ánimo enérgico S': {
    name: 'Ánimo enérgico S',
    badgeBg: 'bg-teal-500/20 border-teal-400/40',
    badgeText: 'text-teal-300',
    iconSymbol: '📣',
    category: 'energy'
  },
  'Autocuración S': {
    name: 'Autocuración S',
    badgeBg: 'bg-purple-500/20 border-purple-500/40',
    badgeText: 'text-purple-300',
    iconSymbol: '🌙',
    category: 'energy'
  },
  'Imán ingredientes S': {
    name: 'Imán ingredientes S',
    badgeBg: 'bg-cyan-500/20 border-cyan-500/40',
    badgeText: 'text-cyan-300',
    iconSymbol: '🧲',
    category: 'ingredients'
  },
  'Ingrediente aleatorio S': {
    name: 'Ingrediente aleatorio S',
    badgeBg: 'bg-emerald-500/20 border-emerald-400/40',
    badgeText: 'text-emerald-300',
    iconSymbol: '🎲',
    category: 'ingredients'
  },
  'Receta sustanciosa S': {
    name: 'Receta sustanciosa S',
    badgeBg: 'bg-orange-500/20 border-orange-500/40',
    badgeText: 'text-orange-300',
    iconSymbol: '🍲',
    category: 'pot'
  },
  'Cocinitas S': {
    name: 'Cocinitas S',
    badgeBg: 'bg-purple-500/20 border-purple-400/40',
    badgeText: 'text-purple-200',
    iconSymbol: '🍳',
    category: 'pot'
  },
  'Metrónomo': {
    name: 'Metrónomo',
    badgeBg: 'bg-pink-500/20 border-pink-500/40',
    badgeText: 'text-pink-300',
    iconSymbol: '🎼',
    category: 'special'
  },
  'Superútil S': {
    name: 'Superútil S',
    badgeBg: 'bg-indigo-500/20 border-indigo-500/40',
    badgeText: 'text-indigo-300',
    iconSymbol: '🏃',
    category: 'special'
  },
  'Bayamanía': {
    name: 'Bayamanía',
    badgeBg: 'bg-rose-500/20 border-rose-500/40',
    badgeText: 'text-rose-300',
    iconSymbol: '🍒',
    category: 'special'
  },
  'Imán fragmentos S': {
    name: 'Imán fragmentos S',
    badgeBg: 'bg-yellow-500/20 border-yellow-500/40',
    badgeText: 'text-yellow-300',
    iconSymbol: '💎',
    category: 'special'
  },
  'Impulso de ayuda S': {
    name: 'Impulso de ayuda S',
    badgeBg: 'bg-violet-500/20 border-violet-500/40',
    badgeText: 'text-violet-300',
    iconSymbol: '🚀',
    category: 'special'
  },
  'Mejora de ayuda (Eléctrico)': {
    name: 'Mejora de ayuda (Eléctrico)',
    badgeBg: 'bg-yellow-500/20 border-yellow-400/40',
    badgeText: 'text-yellow-300',
    iconSymbol: '⚡',
    category: 'special'
  },
  'Mejora de ayuda (Fuego)': {
    name: 'Mejora de ayuda (Fuego)',
    badgeBg: 'bg-red-500/20 border-red-400/40',
    badgeText: 'text-red-300',
    iconSymbol: '🔥',
    category: 'special'
  },
  'Mejora de ayuda (Agua)': {
    name: 'Mejora de ayuda (Agua)',
    badgeBg: 'bg-blue-500/20 border-blue-400/40',
    badgeText: 'text-blue-300',
    iconSymbol: '💧',
    category: 'special'
  },
  'Luz Lunar (Carga energía S)': {
    name: 'Luz Lunar (Carga energía S)',
    badgeBg: 'bg-indigo-500/20 border-indigo-400/40',
    badgeText: 'text-indigo-300',
    iconSymbol: '🌙',
    category: 'energy'
  },
  'Afortunado (Ingrediente aleatorio S)': {
    name: 'Afortunado (Ingrediente aleatorio S)',
    badgeBg: 'bg-purple-500/20 border-purple-400/40',
    badgeText: 'text-purple-300',
    iconSymbol: '🎰',
    category: 'ingredients'
  },
  'Zumo de Baya (Energía para todos S)': {
    name: 'Zumo de Baya (Energía para todos S)',
    badgeBg: 'bg-rose-500/20 border-rose-400/40',
    badgeText: 'text-rose-300',
    iconSymbol: '🍹',
    category: 'energy'
  },
  'Más (Imán ingredientes S)': {
    name: 'Más (Imán ingredientes S)',
    badgeBg: 'bg-cyan-500/20 border-cyan-400/40',
    badgeText: 'text-cyan-300',
    iconSymbol: '➕',
    category: 'ingredients'
  },
  'Menos (Receta sustanciosa S)': {
    name: 'Menos (Receta sustanciosa S)',
    badgeBg: 'bg-orange-500/20 border-orange-400/40',
    badgeText: 'text-orange-300',
    iconSymbol: '➖',
    category: 'pot'
  },
  'Pulso Cura (Ánimo enérgico S)': {
    name: 'Pulso Cura (Ánimo enérgico S)',
    badgeBg: 'bg-pink-500/20 border-pink-400/40',
    badgeText: 'text-pink-300',
    iconSymbol: '💓',
    category: 'energy'
  },
  'Cometa Draco (Bayamanía)': {
    name: 'Cometa Draco (Bayamanía)',
    badgeBg: 'bg-violet-500/20 border-violet-400/40',
    badgeText: 'text-violet-300',
    iconSymbol: '☄️',
    category: 'special'
  },
  'Reserva (Carga vigor S)': {
    name: 'Reserva (Carga vigor S)',
    badgeBg: 'bg-sky-500/20 border-sky-400/40',
    badgeText: 'text-sky-300',
    iconSymbol: '📦',
    category: 'vigor'
  },
  'Plegaria Lunar (Energía para todos S)': {
    name: 'Plegaria Lunar (Energía para todos S)',
    badgeBg: 'bg-purple-500/20 border-purple-400/40',
    badgeText: 'text-purple-300',
    iconSymbol: '✨',
    category: 'energy'
  },
  'Moflete Estático (Ánimo enérgico S)': {
    name: 'Moflete Estático (Ánimo enérgico S)',
    badgeBg: 'bg-purple-500/20 border-purple-400/40',
    badgeText: 'text-purple-200',
    iconSymbol: '🐹',
    category: 'energy'
  },
  'Disfraz (Bayamanía)': {
    name: 'Disfraz (Bayamanía)',
    badgeBg: 'bg-zinc-700/40 border-zinc-500/40',
    badgeText: 'text-zinc-200',
    iconSymbol: '🎭',
    category: 'special'
  },
  'Onda Mental': {
    name: 'Onda Mental',
    badgeBg: 'bg-fuchsia-500/20 border-fuchsia-500/40',
    badgeText: 'text-fuchsia-300',
    iconSymbol: '🧠',
    category: 'special'
  },
  'Mal Sueño': {
    name: 'Mal Sueño',
    badgeBg: 'bg-zinc-800 border-zinc-600',
    badgeText: 'text-zinc-300',
    iconSymbol: '🌑',
    category: 'special'
  },
  'Transformación (Copia habilidades)': {
    name: 'Transformación (Copia habilidades)',
    badgeBg: 'bg-fuchsia-500/20 border-fuchsia-400/40',
    badgeText: 'text-fuchsia-300',
    iconSymbol: '🧬',
    iconUrl: '/images/mainskill/copy.png',
    category: 'special'
  }
};

// Canonical Main Skill by Species
export const SPECIES_MAIN_SKILL_MAP: Record<string, string> = {
  bulbasaur: 'Imán ingredientes S', ivysaur: 'Imán ingredientes S', venusaur: 'Imán ingredientes S',
  charmander: 'Imán ingredientes S', charmeleon: 'Imán ingredientes S', charizard: 'Imán ingredientes S',
  squirtle: 'Imán ingredientes S', wartortle: 'Imán ingredientes S', blastoise: 'Imán ingredientes S',
  caterpie: 'Imán ingredientes S', metapod: 'Imán ingredientes S', butterfree: 'Imán ingredientes S',
  rattata: 'Carga vigor S', raticate: 'Carga vigor S',
  ekans: 'Carga vigor S', arbok: 'Carga vigor S',
  pikachu: 'Carga vigor S', raichu: 'Carga vigor S',
  clefairy: 'Metrónomo', clefable: 'Metrónomo', cleffa: 'Metrónomo',
  vulpix: 'Bayamanía', ninetales: 'Bayamanía',
  jigglypuff: 'Energía para todos S', wigglytuff: 'Energía para todos S', igglybuff: 'Energía para todos S',
  diglett: 'Carga vigor S', dugtrio: 'Carga vigor S',
  meowth: 'Imán fragmentos S', persian: 'Imán fragmentos S',
  psyduck: 'Carga vigor S', golduck: 'Carga vigor S',
  mankey: 'Carga vigor S', primeape: 'Carga vigor S',
  growlithe: 'Superútil S', arcanine: 'Superútil S',
  bellsprout: 'Imán ingredientes S', weepinbell: 'Imán ingredientes S', victreebel: 'Imán ingredientes S',
  geodude: 'Carga vigor S', graveler: 'Carga vigor S', golem: 'Carga vigor S',
  slowpoke: 'Carga energía S', slowbro: 'Carga energía S', slowking: 'Carga energía S',
  magnemite: 'Receta sustanciosa S', magneton: 'Receta sustanciosa S', magnezone: 'Receta sustanciosa S',
  doduo: 'Carga vigor S', dodrio: 'Carga vigor S',
  gastly: 'Carga vigor S', haunter: 'Carga vigor S', gengar: 'Carga vigor S',
  onix: 'Imán ingredientes S', steelix: 'Imán ingredientes S',
  cubone: 'Carga vigor S', marowak: 'Carga vigor S',
  kangaskhan: 'Imán ingredientes S',
  pinsir: 'Carga vigor S',
  ditto: 'Transformación (Copia habilidades)',
  eevee: 'Imán ingredientes S',
  vaporeon: 'Imán ingredientes S',
  jolteon: 'Superútil S',
  flareon: 'Receta sustanciosa S',
  espeon: 'Carga vigor M',
  umbreon: 'Autocuración S',
  leafeon: 'Cura de energía S',
  glaceon: 'Receta sustanciosa S',
  sylveon: 'Energía para todos S',
  dratini: 'Carga energía S', dragonair: 'Carga energía S', dragonite: 'Carga energía S',
  chikorita: 'Carga vigor S', bayleef: 'Carga vigor S', meganium: 'Carga vigor S',
  cyndaquil: 'Carga vigor S', quilava: 'Carga vigor S', typhlosion: 'Carga vigor S',
  totodile: 'Carga vigor S', croconaw: 'Carga vigor S', feraligatr: 'Carga vigor S',
  togepi: 'Metrónomo', togetic: 'Metrónomo', togekiss: 'Metrónomo',
  mareep: 'Carga vigor M', flaaffy: 'Carga vigor M', ampharos: 'Carga vigor M',
  sudowoodo: 'Carga vigor M', bonsly: 'Carga vigor M',
  wooper: 'Carga energía S', quagsire: 'Carga energía S',
  wobbuffet: 'Cura de energía S',
  heracross: 'Imán ingredientes S',
  houndour: 'Carga vigor S', houndoom: 'Carga vigor S',
  larvitar: 'Carga energía S', pupitar: 'Carga energía S', tyranitar: 'Carga energía S',
  treecko: 'Carga vigor S', grovyle: 'Carga vigor S', sceptile: 'Carga vigor S',
  torchic: 'Carga vigor S', combusken: 'Carga vigor S', blaziken: 'Carga vigor S',
  mudkip: 'Carga vigor S', marshtomp: 'Carga vigor S', swampert: 'Carga vigor S',
  slakoth: 'Imán ingredientes S', vigoroth: 'Imán ingredientes S', slaking: 'Imán ingredientes S',
  sableye: 'Imán fragmentos S',
  gulpin: 'Imán fragmentos S', swalot: 'Imán fragmentos S',
  swablu: 'Carga energía S', altaria: 'Carga energía S',
  shuppet: 'Carga vigor S', banette: 'Carga vigor S',
  absol: 'Carga energía S',
  spheal: 'Imán ingredientes S', sealeo: 'Imán ingredientes S', walrein: 'Imán ingredientes S',
  ralts: 'Energía para todos S', kirlia: 'Energía para todos S', gardevoir: 'Energía para todos S', gallade: 'Superútil S',
  turtwig: 'Imán ingredientes S', grotle: 'Imán ingredientes S', torterra: 'Imán ingredientes S',
  chimchar: 'Carga vigor S', monferno: 'Carga vigor S', infernape: 'Carga vigor S',
  piplup: 'Carga vigor S', prinplup: 'Carga vigor S', empoleon: 'Carga vigor S',
  shinx: 'Carga vigor S', luxio: 'Carga vigor S', luxray: 'Carga vigor S',
  happiny: 'Energía para todos S', chansey: 'Energía para todos S', blissey: 'Energía para todos S',
  riolu: 'Imán fragmentos S', lucario: 'Imán fragmentos S',
  croagunk: 'Carga vigor S', toxicroak: 'Carga vigor S',
  snover: 'Carga energía S', abomasnow: 'Carga energía S',
  darkrai: 'Mal Sueño',
  foongus: 'Imán ingredientes S', amoonguss: 'Imán ingredientes S',
  rufflet: 'Bayamanía', braviary: 'Bayamanía',
  cutiefly: 'Imán ingredientes S', ribombee: 'Imán ingredientes S',
  stufful: 'Carga vigor S', bewear: 'Carga vigor S',
  mimikyu: 'Disfraz (Bayamanía)',
  dwebble: 'Ingrediente aleatorio S', crustle: 'Ingrediente aleatorio S',
  sandshrew: 'Ingrediente aleatorio S', sandslash: 'Ingrediente aleatorio S',
  hawlucha: 'Ingrediente aleatorio S',
  murkrow: 'Afortunado (Ingrediente aleatorio S)', honchkrow: 'Afortunado (Ingrediente aleatorio S)',
  shuckle: 'Zumo de Baya (Energía para todos S)',
  plusle: 'Más (Imán ingredientes S)', minun: 'Menos (Receta sustanciosa S)',
  latias: 'Pulso Cura (Ánimo enérgico S)', latios: 'Cometa Draco (Bayamanía)',
  drifloon: 'Reserva (Carga vigor S)', drifblim: 'Reserva (Carga vigor S)',
  cresselia: 'Plegaria Lunar (Energía para todos S)',
  dedenne: 'Cocinitas S',
  togedemaru: 'Moflete Estático (Ánimo enérgico S)',
  raikou: 'Mejora de ayuda (Eléctrico)', entei: 'Mejora de ayuda (Fuego)', suicune: 'Mejora de ayuda (Agua)',
  farfetchd: 'Imán ingredientes S', 'farfetch’d': 'Imán ingredientes S',
  'mr. mime': 'Carga vigor S', 'mime jr.': 'Carga vigor S',
  comfey: 'Energía para todos S',
  cramorant: 'Afortunado (Ingrediente aleatorio S)',
  sprigatito: 'Imán ingredientes S', floragato: 'Imán ingredientes S', meowscarada: 'Imán ingredientes S',
  fuecoco: 'Carga energía S', crocalor: 'Carga energía S', skeledirge: 'Carga energía S',
  quaxly: 'Carga vigor S', quaxwell: 'Carga vigor S', quaquaval: 'Carga vigor S',
  pawmi: 'Energía para todos S', pawmo: 'Energía para todos S', pawmot: 'Energía para todos S',
  tinkatink: 'Carga energía S', tinkatuff: 'Carga energía S', tinkaton: 'Carga energía S',
  mew: 'Metrónomo',
  mewtwo: 'Onda Mental'
};

export function normalizeMainSkillName(skillName?: string): string {
  if (!skillName) return 'Carga vigor S';
  const clean = skillName.trim();
  const lower = clean.toLowerCase();

  // Ditto's signature Transform / Skill Copy variants
  if (
    lower.includes('transform') ||
    lower.includes('copia habilidad') ||
    lower.includes('skill copy') ||
    lower === 'copia' ||
    lower === 'transformación' ||
    lower === 'transformacion'
  ) {
    return 'Transformación (Copia habilidades)';
  }

  // Exact match in official metadata
  if (MAIN_SKILLS_META[clean]) {
    return clean;
  }

  // Case-insensitive / normalized lookup
  for (const key of Object.keys(MAIN_SKILLS_META)) {
    if (key.toLowerCase() === lower) {
      return key;
    }
  }

  return clean;
}

export function getPokemonCanonicalSkill(name: string): string {
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (clean === 'ditto') {
    return 'Transformación (Copia habilidades)';
  }
  const master = getSpeciesMasterData(name);
  if (master?.mainSkill) {
    return normalizeMainSkillName(master.mainSkill);
  }
  if (SPECIES_MAIN_SKILL_MAP[clean]) {
    return normalizeMainSkillName(SPECIES_MAIN_SKILL_MAP[clean]);
  }
  for (const [key, skill] of Object.entries(SPECIES_MAIN_SKILL_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return normalizeMainSkillName(skill);
    }
  }
  return 'Carga vigor S';
}

export function getMainSkillMeta(skillName: string): MainSkillMeta {
  const normalized = normalizeMainSkillName(skillName);
  const meta = MAIN_SKILLS_META[normalized] || MAIN_SKILLS_META[skillName];
  if (meta) {
    return {
      ...meta,
      name: meta.name || normalized,
      iconUrl: meta.iconUrl || getMainSkillIconUrl(normalized)
    };
  }
  return {
    name: skillName,
    badgeBg: 'bg-slate-800 border-slate-700',
    badgeText: 'text-slate-300',
    iconSymbol: '✨',
    iconUrl: getMainSkillIconUrl(skillName),
    category: 'special'
  };
}

// Pokemon Type colors & aesthetics
export interface TypeTheme {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  glow: string;
  gradient: string;
}

export const POKEMON_TYPE_THEMES: Record<string, TypeTheme> = {
  'Eléctrico': {
    name: 'Eléctrico',
    badgeBg: 'bg-amber-400/20',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/40',
    glow: 'rgba(251, 191, 36, 0.25)',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent'
  },
  'Fuego': {
    name: 'Fuego',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-500/40',
    glow: 'rgba(249, 115, 22, 0.25)',
    gradient: 'from-orange-500/20 via-red-500/10 to-transparent'
  },
  'Agua': {
    name: 'Agua',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400',
    badgeBorder: 'border-blue-500/40',
    glow: 'rgba(59, 130, 246, 0.25)',
    gradient: 'from-blue-500/20 via-sky-500/10 to-transparent'
  },
  'Planta': {
    name: 'Planta',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/40',
    glow: 'rgba(16, 185, 129, 0.25)',
    gradient: 'from-emerald-500/20 via-green-500/10 to-transparent'
  },
  'Psíquico': {
    name: 'Psíquico',
    badgeBg: 'bg-fuchsia-500/20',
    badgeText: 'text-fuchsia-400',
    badgeBorder: 'border-fuchsia-500/40',
    glow: 'rgba(217, 70, 239, 0.25)',
    gradient: 'from-fuchsia-500/20 via-pink-500/10 to-transparent'
  },
  'Fantasma': {
    name: 'Fantasma',
    badgeBg: 'bg-purple-600/20',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-500/40',
    glow: 'rgba(147, 51, 234, 0.25)',
    gradient: 'from-purple-600/20 via-indigo-600/10 to-transparent'
  },
  'Normal': {
    name: 'Normal',
    badgeBg: 'bg-slate-500/20',
    badgeText: 'text-slate-300',
    badgeBorder: 'border-slate-500/40',
    glow: 'rgba(148, 163, 184, 0.25)',
    gradient: 'from-slate-500/20 via-slate-600/10 to-transparent'
  },
  'Siniestro': {
    name: 'Siniestro',
    badgeBg: 'bg-zinc-700/30',
    badgeText: 'text-zinc-300',
    badgeBorder: 'border-zinc-600/40',
    glow: 'rgba(63, 63, 70, 0.3)',
    gradient: 'from-zinc-700/20 via-zinc-800/10 to-transparent'
  },
  'Hada': {
    name: 'Hada',
    badgeBg: 'bg-pink-400/20',
    badgeText: 'text-pink-300',
    badgeBorder: 'border-pink-400/40',
    glow: 'rgba(244, 114, 182, 0.25)',
    gradient: 'from-pink-400/20 via-rose-400/10 to-transparent'
  },
  'Roca': {
    name: 'Roca',
    badgeBg: 'bg-stone-500/20',
    badgeText: 'text-stone-300',
    badgeBorder: 'border-stone-500/40',
    glow: 'rgba(120, 113, 108, 0.25)',
    gradient: 'from-stone-500/20 via-stone-600/10 to-transparent'
  },
  'Tierra': {
    name: 'Tierra',
    badgeBg: 'bg-yellow-700/20',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-600/40',
    glow: 'rgba(161, 98, 7, 0.25)',
    gradient: 'from-yellow-700/20 via-amber-700/10 to-transparent'
  },
  'Hielo': {
    name: 'Hielo',
    badgeBg: 'bg-cyan-400/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/40',
    glow: 'rgba(34, 211, 238, 0.25)',
    gradient: 'from-cyan-400/20 via-sky-400/10 to-transparent'
  },
  'Lucha': {
    name: 'Lucha',
    badgeBg: 'bg-red-700/20',
    badgeText: 'text-red-400',
    badgeBorder: 'border-red-600/40',
    glow: 'rgba(185, 28, 28, 0.25)',
    gradient: 'from-red-700/20 via-rose-700/10 to-transparent'
  },
  'Veneno': {
    name: 'Veneno',
    badgeBg: 'bg-violet-600/20',
    badgeText: 'text-violet-300',
    badgeBorder: 'border-violet-500/40',
    glow: 'rgba(124, 58, 237, 0.25)',
    gradient: 'from-violet-600/20 via-purple-700/10 to-transparent'
  },
  'Volador': {
    name: 'Volador',
    badgeBg: 'bg-indigo-400/20',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-400/40',
    glow: 'rgba(129, 140, 248, 0.25)',
    gradient: 'from-indigo-400/20 via-blue-500/10 to-transparent'
  },
  'Acero': {
    name: 'Acero',
    badgeBg: 'bg-slate-400/20',
    badgeText: 'text-slate-200',
    badgeBorder: 'border-slate-400/40',
    glow: 'rgba(148, 163, 184, 0.25)',
    gradient: 'from-slate-400/20 via-gray-500/10 to-transparent'
  },
  'Dragón': {
    name: 'Dragón',
    badgeBg: 'bg-indigo-700/20',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-600/40',
    glow: 'rgba(99, 102, 241, 0.25)',
    gradient: 'from-indigo-700/20 via-blue-700/10 to-transparent'
  },
  'Bicho': {
    name: 'Bicho',
    badgeBg: 'bg-lime-600/20',
    badgeText: 'text-lime-300',
    badgeBorder: 'border-lime-500/40',
    glow: 'rgba(132, 204, 22, 0.25)',
    gradient: 'from-lime-600/20 via-emerald-600/10 to-transparent'
  }
};

export function getTypeTheme(typeName: string): TypeTheme {
  return POKEMON_TYPE_THEMES[typeName] || POKEMON_TYPE_THEMES['Normal'];
}

// Official Pokemon Sleep Dish Artwork from WikiDex (as seen in the PDF)
export const DISH_IMAGE_FILE_MAP: Record<string, string> = {
  // Guisos y curris
  'Curri Mixto': 'Curri_Mixto_Sleep.png',
  'Curri de Manzana Selecta': 'Curri_de_Manzana_Selecta_Sleep.png',
  'Curri de Cola a la Parrilla': 'Curri_de_Cola_a_la_Parrilla_Sleep.png',
  'Curri de Tomate "Poder Solar"': 'Curri_de_Tomate_Poder_Solar_Sleep.png',
  'Curri Cremoso "Comesueños"': 'Curri_Cremoso_Comesue%C3%B1os_Sleep.png',
  'Curri de Puerro Picante': 'Curri_de_Puerro_Picante_Sleep.png',
  'Curri de Setas "Espora"': 'Curri_de_Setas_Espora_Sleep.png',
  'Curri "Bomba Huevo"': 'Curri_Bomba_Huevo_Sleep.png',
  'Curri de Hamburguesa con Queso': 'Curri_de_Hamburguesa_con_Queso_Sleep.png',
  'Estofado de Patata': 'Estofado_de_Patata_Sleep.png',
  'Sopa Cremosa': 'Sopa_Cremosa_Sleep.png',
  'Curri de Hamburguesa Vegetariana': 'Curri_de_Hamburguesa_Vegetariana_Sleep.png',
  'Curri Meloso': 'Curri_Meloso_Sleep.png',
  'Curri Ninja': 'Curri_Ninja_Sleep.png',
  'Curri con Escalope "Sequía"': 'Curri_con_Escalope_Sequ%C3%ADa_Sleep.png',
  'Curri de Tortilla Jugosa': 'Curri_de_Tortilla_Jugosa_Sleep.png',
  'Curri de Habas "Corpulencia"': 'Curri_de_Habas_Corpulencia_Sleep.png',
  'Guiso de Maíz "Flexibilidad"': 'Guiso_de_Ma%C3%ADz_Flexibilidad_Sleep.png',
  'Curri Keema de Maíz "Infierno"': 'Curri_Keema_de_Ma%C3%ADz_Infierno_Sleep.png',
  'Curri Picante "Puño Mareo"': 'Curri_Picante_Pu%C3%B1o_Mareo_Sleep.png',
  'Crema Vigorizante "Poder Oculto"': 'Crema_Vigorizante_Poder_Oculto_Sleep.png',
  'Curri Sukiyaki "Corte"': 'Curri_Sukiyaki_Corte_Sleep.png',
  'Guiso Pumpkaboo "Imitación"': 'Guiso_Pumpkaboo_Imitaci%C3%B3n_Sleep.png',
  'Aguacates Gratinados "Espesura"': 'Aguacates_Gratinados_Espesura_Sleep.png',
  'Bollito de Curri Verdegal': 'Bollito_de_Curri_Verdegal_Sleep.png',
  'Udon al Curri "Bote"': 'Udon_al_Curri_Bote_Sleep.png',

  // Ensaladas
  'Ensalada Mixta': 'Ensalada_Mixta_Sleep.png',
  'Ensalada de Cola de Slowpoke a la Pimienta': 'Ensalada_de_Cola_de_Slowpoke_a_la_Pimienta_Sleep.png',
  'Ensalada de Setas "Espora"': 'Ensalada_de_Setas_Espora_Sleep.png',
  'Ensalada César "Manto Níveo"': 'Ensalada_C%C3%A9sar_Manto_N%C3%ADveo_Sleep.png',
  'Ensalada de Patata "Gula"': 'Ensalada_de_Patata_Gula_Sleep.png',
  'Ensalada de Tofu "Velo Agua"': 'Ensalada_de_Tofu_Velo_Agua_Sleep.png',
  'Ensaladón "Fuerza Bruta"': 'Ensalad%C3%B3n_Fuerza_Bruta_Sleep.png',
  'Ensalada de Jamón Vegetariano': 'Ensalada_de_Jam%C3%B3n_Vegetariano_Sleep.png',
  'Ensalada de Siestomate': 'Ensalada_de_Siestomate_Sleep.png',
  'Ensalada con Mozzarella de Leche Mu-mu': 'Ensalada_con_Mozzarella_de_Leche_Mu-mu_Sleep.png',
  'Ensalada de Carne al Cacao "Respondón"': 'Ensalada_de_Carne_al_Cacao_Respond%C3%B3n_Sleep.png',
  'Ensalada de Jengibre "Sofoco"': 'Ensalada_de_Jengibre_Sofoco_Sleep.png',
  'Ensalada de Manzana Selecta': 'Ensalada_de_Manzana_Selecta_Sleep.png',
  'Ensalada de Puerro "Inmunidad"': 'Ensalada_de_Puerro_Inmunidad_Sleep.png',
  'Ensalada de Manzana y Queso "Atracción"': 'Ensalada_de_Manzana_y_Queso_Atracci%C3%B3n_Sleep.png',
  'Ensalada Ninja': 'Ensalada_Ninja_Sleep.png',
  'Ensalada de Tofu "Onda Ígnea"': 'Ensalada_de_Tofu_Onda_%C3%8Dgnea_Sleep.png',
  'Ensalada Verdegal': 'Ensalada_Verdegal_Sleep.png',
  'Ensalada de Fruta "Paz Mental"': 'Ensalada_de_Fruta_Paz_Mental_Sleep.png',
  'Ensalada de Maíz "Ataque Furia"': 'Ensalada_de_Ma%C3%ADz_Ataque_Furia_Sleep.png',
  'Ensalada "Tajo Cruzado"': 'Ensalada_Tajo_Cruzado_Sleep.png',
  'Ensalada con Aliño de Café "Competitivo"': 'Ensalada_con_Ali%C3%B1o_de_Caf%C3%A9_Competitivo_Sleep.png',
  'Corona de Ensalada "Tormenta Floral"': 'Corona_de_Ensalada_Tormenta_Floral_Sleep.png',
  'Ensalada con Aliño de Yogur "Ácido Málico"': 'Ensalada_con_Ali%C3%B1o_de_Yogur_%C3%81cido_M%C3%A1lico_Sleep.png',
  'Ensalada de Aguacate "Armadura Frágil"': 'Ensalada_de_Aguacate_Armadura_Fr%C3%A1gil_Sleep.png',
  'Nachos con Guacamole "Terratemblor"': 'Nachos_con_Guacamole_Terratemblor_Sleep.png',
  'Verduras al Vapor "Escaldar"': 'Verduras_al_Vapor_Escaldar_Sleep.png',

  // Postres y bebidas
  'Zumo Mixto': 'Zumo_Mixto_Sleep.png',
  'Boniatos "Peluche"': 'Boniatos_Peluche_Sleep.png',
  'Galletas de Jengibre "Impasible"': 'Galletas_de_Jengibre_Impasible_Sleep.png',
  'Zumo de Manzana Selecta': 'Zumo_de_Manzana_Selecta_Sleep.png',
  'Refresco Casero': 'Refresco_Casero_Sleep.png',
  'Té de Jengibre "Ascuas"': 'T%C3%A9_de_Jengibre_Ascuas_Sleep.png',
  'Flan con Frutas de Jigglypuff': 'Flan_con_Frutas_de_Jigglypuff_Sleep.png',
  'Batido "Beso Amoroso"': 'Batido_Beso_Amoroso_Sleep.png',
  'Tarta de Manzana "Deseo"': 'Tarta_de_Manzana_Deseo_Sleep.png',
  'Té Reparador de Neroli': 'T%C3%A9_Reparador_de_Neroli_Sleep.png',
  'Tarta de Chocolate "Dulce Aroma"': 'Tarta_de_Chocolate_Dulce_Aroma_Sleep.png',
  'Leche Mu-mu Caliente': 'Leche_Mu-mu_Caliente_Sleep.png',
  'Bizcocho de Soja "Liviano"': 'Bizcocho_de_Soja_Liviano_Sleep.png',
  'Batido de Proteínas "Entusiasmo"': 'Batido_de_Prote%C3%ADnas_Entusiasmo_Sleep.png',
  'Zumo de Verduras "Acérrimo"': 'Zumo_de_Verduras_Ac%C3%A9rrimo_Sleep.png',
  'Malasada Maxi': 'Malasada_Maxi_Sleep.png',
  'Dónuts de Soja "Potencia"': 'D%C3%B3nuts_de_Soja_Potencia_Sleep.png',
  'Palomitas "Explosión"': 'Palomitas_Explosi%C3%B3n_Sleep.png',
  'Panecillos de Maíz "Hora del Té"': 'Panecillos_de_Ma%C3%ADz_Hora_del_T%C3%A9_Sleep.png',
  'Tartaleta de Chocolate "Danza Pétalo"': 'Tartaleta_de_Chocolate_Danza_P%C3%A9talo_Sleep.png',
  'Macarons "Don Floral"': 'Macarons_Don_Floral_Sleep.png',
  'Gelatina de Café "Madrugar"': 'Gelatina_de_Caf%C3%A9_Madrugar_Sleep.png',
  'Cola Especiada "Chispa"': 'Cola_Especiada_Chispa_Sleep.png',
  'Tiramisú de Maíz "Rompemoldes"': 'Tiramis%C3%BA_de_Ma%C3%ADz_Rompemoldes_Sleep.png',
  'Petisú Clodsire': 'Petis%C3%BA_Clodsire_Sleep.png',
  'Tortitas "Cara Susto"': 'Tortitas_Cara_Susto_Sleep.png',
  'Batido "Ciclón de Hojas"': 'Batido_Cicl%C3%B3n_de_Hojas_Sleep.png',
  'Gofres de Chocolate "Recogemiel"': 'Gofres_de_Chocolate_Recogemiel_Sleep.png'
};

export function getDishImageUrl(dishName: string): string {
  const directFile = DISH_IMAGE_FILE_MAP[dishName];
  if (directFile) {
    return `https://www.wikidex.net/wiki/Especial:Redirigir/file/${directFile}`;
  }

  // Fallback cleaning
  const clean = dishName.replace(/["“”«»]/g, '').trim().replace(/\s+/g, '_');
  return `https://www.wikidex.net/wiki/Especial:Redirigir/file/${encodeURIComponent(clean + '_Sleep.png')}`;
}

// Special / Legendary / Mythical Pokémon set (Official Pokemon Sleep rule: max 1 per team)
export const SPECIAL_POKEMON_SET = new Set([
  'mew', 'mewtwo', 'darkrai', 'cresselia',
  'raikou', 'entei', 'suicune',
  'articuno', 'zapdos', 'moltres',
  'lugia', 'hooh', 'ho-oh', 'celebi',
  'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys',
  'dialga', 'palkia', 'giratina', 'arceus', 'manaphy', 'phione', 'shaymin',
  'reshiram', 'zekrom', 'kyurem', 'victini', 'genesect',
  'xerneas', 'yveltal', 'zygarde', 'diancie', 'hoopa', 'volcanion',
  'solgaleo', 'lunala', 'necrozma', 'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal',
  'zacian', 'zamazenta', 'eternatus', 'zarude', 'calyrex', 'koraidon', 'miraidon', 'pecharunt', 'terapagos', 'ogerpon'
]);

export function isSpecialPokemon(pokemonOrName: any): boolean {
  if (!pokemonOrName) return false;
  const name = typeof pokemonOrName === 'string' ? pokemonOrName : pokemonOrName.name;
  if (!name) return false;
  const clean = name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (SPECIAL_POKEMON_SET.has(clean)) return true;
  for (const s of SPECIAL_POKEMON_SET) {
    if (clean === s || clean.startsWith(s)) return true;
  }
  return false;
}

// High-resolution vector Pokéball SVG sprites for Snorlax Rank tiers
export const POKEBALL_SPRITES = {
  pokeBall: '/images/pokeballs/poke-ball.svg',
  greatBall: '/images/pokeballs/great-ball.svg',
  ultraBall: '/images/pokeballs/ultra-ball.svg',
  masterBall: '/images/pokeballs/master-ball.svg',
  dreamBall: '/images/pokeballs/master-ball.svg'
} as const;

export function getRankPokeballUrl(rankName: string): string {
  if (!rankName) return POKEBALL_SPRITES.pokeBall;
  if (rankName.startsWith('Máster') || rankName.startsWith('Master')) {
    return POKEBALL_SPRITES.masterBall;
  }
  if (rankName.startsWith('Ultra')) {
    return POKEBALL_SPRITES.ultraBall;
  }
  if (rankName.startsWith('Súper') || rankName.startsWith('Super')) {
    return POKEBALL_SPRITES.greatBall;
  }
  return POKEBALL_SPRITES.pokeBall;
}

