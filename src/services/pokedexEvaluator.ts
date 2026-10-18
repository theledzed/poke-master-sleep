import { Pokemon, Specialty } from '../types/pokemon';
import { isSpecialPokemon } from './pokeApiService';

export type PokedexTier = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export type PokedexVerdict =
  | 'TITULAR_ELITE'       // 👑 Lo mejor de tu caja, listo para competir (genética top + nivel >= 20)
  | 'PROMESA_INVERTIR'     // 💎 Nivel bajo pero genética brutal, prioridad #1 de caramelos
  | 'TROFEO_CONSERVAR'    // ✨ Shiny / Singular / Legendario (intocable para colección)
  | 'UTIL_TEMPORAL'       // ⚠️ Genética débil, pero es tu único ejemplar de esa baya/especie
  | 'UTIL_NICHO'          // 🛠️ Buen rol secundario o de rotación
  | 'CAMBIAR_CARAMELOS';  // 🍬 Duplicado inferior o saboteado, enviar al Profesor por caramelos

export interface PokemonAuditResult {
  pokemon: Pokemon;
  geneticScore: number; // 0 a 100 pts
  tier: PokedexTier;
  verdict: PokedexVerdict;
  verdictLabel: string;
  verdictBadgeColor: string;
  pros: string[];         // Razones de por qué SÍ es viable
  cons: string[];         // Razones de por qué NO vale la pena o debilidades
  recommendation: string; // Veredicto claro y directo para el jugador
  betterDuplicateName?: string;
  isMonoIngredient?: boolean;
}

// Mapeo exhaustivo de familias evolutivas oficiales de Pokémon Sleep
const EVOLUTION_FAMILY_MAP: Record<string, string> = {
  // Gen 1
  bulbasaur: 'bulbasaur', ivysaur: 'bulbasaur', venusaur: 'bulbasaur',
  charmander: 'charmander', charmeleon: 'charmander', charizard: 'charmander',
  squirtle: 'squirtle', wartortle: 'squirtle', blastoise: 'squirtle',
  caterpie: 'caterpie', metapod: 'caterpie', butterfree: 'caterpie',
  rattata: 'rattata', raticate: 'rattata',
  ekans: 'ekans', arbok: 'ekans',
  pikachu: 'pikachu', raichu: 'pikachu', pichu: 'pikachu',
  clefairy: 'clefairy', clefable: 'clefairy', cleffa: 'clefairy',
  vulpix: 'vulpix', ninetales: 'vulpix',
  jigglypuff: 'jigglypuff', wigglytuff: 'jigglypuff', igglybuff: 'jigglypuff',
  diglett: 'diglett', dugtrio: 'diglett',
  meowth: 'meowth', persian: 'meowth',
  psyduck: 'psyduck', golduck: 'psyduck',
  mankey: 'mankey', primeape: 'mankey',
  growlithe: 'growlithe', arcanine: 'growlithe',
  bellsprout: 'bellsprout', weepinbell: 'bellsprout', victreebel: 'bellsprout',
  geodude: 'geodude', graveler: 'geodude', golem: 'geodude',
  slowpoke: 'slowpoke', slowbro: 'slowpoke', slowking: 'slowpoke',
  magnemite: 'magnemite', magneton: 'magnemite', magnezone: 'magnemite',
  farfetchd: 'farfetchd',
  doduo: 'doduo', dodrio: 'doduo',
  gastly: 'gastly', haunter: 'gastly', gengar: 'gastly',
  onix: 'onix', steelix: 'onix',
  cubone: 'cubone', marowak: 'cubone',
  chansey: 'chansey', blissey: 'chansey', happiny: 'chansey',
  kangaskhan: 'kangaskhan',
  mrmime: 'mrmime', mimejr: 'mrmime',
  pinsir: 'pinsir',
  ditto: 'ditto',
  eevee: 'eevee', vaporeon: 'eevee', jolteon: 'eevee', flareon: 'eevee',
  espeon: 'eevee', umbreon: 'eevee', leafeon: 'eevee', glaceon: 'eevee', sylveon: 'eevee',
  dratini: 'dratini', dragonair: 'dratini', dragonite: 'dratini',
  mewtwo: 'mewtwo',
  mew: 'mew',
  // Gen 2
  chikorita: 'chikorita', bayleef: 'chikorita', meganium: 'chikorita',
  cyndaquil: 'cyndaquil', quilava: 'cyndaquil', typhlosion: 'cyndaquil',
  totodile: 'totodile', croconaw: 'totodile', feraligatr: 'totodile',
  mareep: 'mareep', flaaffy: 'mareep', ampharos: 'mareep',
  sudowoodo: 'sudowoodo', bonsly: 'sudowoodo',
  wooper: 'wooper', quagsire: 'wooper', clodsire: 'wooper',
  murkrow: 'murkrow', honchkrow: 'murkrow',
  wobbuffet: 'wobbuffet', wynaut: 'wobbuffet',
  heracross: 'heracross',
  delibird: 'delibird',
  houndour: 'houndour', houndoom: 'houndour',
  larvitar: 'larvitar', pupitar: 'larvitar', tyranitar: 'larvitar',
  raikou: 'raikou',
  entei: 'entei',
  suicune: 'suicune',
  // Gen 3+
  treecko: 'treecko', grovyle: 'treecko', sceptile: 'treecko',
  torchic: 'torchic', combusken: 'torchic', blaziken: 'torchic',
  mudkip: 'mudkip', marshtomp: 'mudkip', swampert: 'mudkip',
  slakoth: 'slakoth', vigoroth: 'slakoth', slaking: 'slakoth',
  sableye: 'sableye',
  swablu: 'swablu', altaria: 'swablu',
  shuppet: 'shuppet', banette: 'shuppet',
  absol: 'absol',
  spheal: 'spheal', sealeo: 'spheal', walrein: 'spheal',
  bagon: 'bagon', shelgon: 'bagon', salamence: 'bagon',
  latias: 'latias',
  latios: 'latios',
  turtwig: 'turtwig', grotle: 'turtwig', torterra: 'turtwig',
  chimchar: 'chimchar', monferno: 'chimchar', infernape: 'chimchar',
  piplup: 'piplup', prinplup: 'piplup', empoleon: 'piplup',
  shinx: 'shinx', luxio: 'shinx', luxray: 'shinx',
  drifloon: 'drifloon', drifblim: 'drifblim',
  riolu: 'riolu', lucario: 'riolu',
  croagunk: 'croagunk', toxicroak: 'croagunk',
  snover: 'snover', abomasnow: 'snover',
  darkrai: 'darkrai',
  cresselia: 'cresselia',
  rufflet: 'rufflet', braviary: 'rufflet',
  sprigatito: 'sprigatito', floragato: 'sprigatito', meowscarada: 'sprigatito',
  fuecoco: 'fuecoco', crocalor: 'fuecoco', skeledirge: 'fuecoco',
  quaxly: 'quaxly', quaxwell: 'quaxly', quaquaval: 'quaxly',
  pawmi: 'pawmi', pawmo: 'pawmi', pawmot: 'pawmi',
  tinkatink: 'tinkatink', tinkatuff: 'tinkatink', tinkaton: 'tinkatink'
};

export function getPokemonFamilyKey(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return EVOLUTION_FAMILY_MAP[clean] || clean;
}

/**
 * Evalúa la genética intrínseca de un Pokémon (0 a 100 pts)
 * según su Especialidad oficial de WikiDex, Naturaleza y Subhabilidades ponderadas.
 */
export function evaluateSinglePokemonGenetics(pokemon: Pokemon): {
  score: number;
  pros: string[];
  cons: string[];
  isMonoIngredient: boolean;
} {
  let score = 50; // Base neutra
  const pros: string[] = [];
  const cons: string[] = [];
  const spec = pokemon.specialty;
  const nat = pokemon.natureObj;
  const isShiny = /shiny|variocolor/i.test(pokemon.notes || '');

  // Ponderación por ranura de subhabilidad según distancia de nivel (WikiDex: 10, 25, 50)
  // Si el Pokémon ya tiene ese nivel desbloqueado en juego, cuenta al 100% de inmediato.
  const slotWeights = [
    pokemon.level >= 10 ? 1.0 : 0.95,
    pokemon.level >= 25 ? 1.0 : 0.80,
    pokemon.level >= 50 ? 1.0 : 0.50
  ];

  const getSubWeight = (subName: string): { weight: number; slot: number } => {
    let totalWeight = 0;
    let foundSlot = -1;
    pokemon.subskills.slice(0, 3).forEach((sub, idx) => {
      if (sub.name === subName) {
        totalWeight += slotWeights[idx] ?? 0.5;
        foundSlot = idx === 0 ? 10 : idx === 1 ? 25 : 50;
      }
    });
    return { weight: totalWeight, slot: foundSlot };
  };

  // 1. Subhabilidades Doradas Universales (Meta S Tier)
  const bfs = getSubWeight('Busca bayas S');
  if (bfs.weight > 0) {
    const pts = Math.round((spec === 'Bayas' || spec === 'Todo' ? 30 : 18) * bfs.weight);
    score += pts;
    pros.push(`🌟 "Busca bayas S" (Nv. ${bfs.slot}): +1 baya extra por ayuda (+50% vigor en bayas). (+${pts} pts)`);
  }

  const helpingBonus = getSubWeight('Bonus ayuda');
  if (helpingBonus.weight > 0) {
    const pts = Math.round(22 * helpingBonus.weight);
    score += pts;
    pros.push(`🤝 "Bonus ayuda" (Nv. ${helpingBonus.slot}): -5% tiempo de ayuda para los 5 miembros del equipo. (+${pts} pts)`);
  }

  // 2. Velocidad de ayuda (Universalmente excelente)
  const hsm = getSubWeight('Velocidad ayuda M');
  if (hsm.weight > 0) {
    const pts = Math.round(15 * hsm.weight);
    score += pts;
    pros.push(`⚡ "Velocidad ayuda M" (Nv. ${hsm.slot}): -14% tiempo entre ayudas. (+${pts} pts)`);
  }
  const hss = getSubWeight('Velocidad ayuda S');
  if (hss.weight > 0) {
    const pts = Math.round(8 * hss.weight);
    score += pts;
    pros.push(`⚡ "Velocidad ayuda S" (Nv. ${hss.slot}): -7% tiempo entre ayudas. (+${pts} pts)`);
  }

  // 3. Evaluación según Especialidad
  let isMonoIngredient = false;

  if (spec === 'Bayas') {
    // Naturaleza
    if (nat?.speedMod && nat.speedMod < 1.0) {
      score += 15;
      pros.push(`🔥 Naturaleza favorable en Rapidez de ayuda (+10% velocidad: ${nat.name}). (+15 pts)`);
    } else if (nat?.speedMod && nat.speedMod > 1.0) {
      score -= 20;
      cons.push(`❌ Naturaleza desfavorable que reduce su Rapidez de ayuda (-10%: ${nat.name}). (-20 pts)`);
    }

    if (nat?.ingMod && nat.ingMod < 1.0) {
      score += 12;
      pros.push(`🍒 Naturaleza reduce ingredientes (-20%: ${nat.name}), forzando casi 100% tiradas de bayas dobles. (+12 pts)`);
    } else if (nat?.ingMod && nat.ingMod > 1.0) {
      score -= 12;
      cons.push(`⚠️ Naturaleza sube ingredientes (+20%: ${nat.name}), lo que interfiere con su recolección de bayas. (-12 pts)`);
    }

    // Penalización por Más Ingredientes en slots tempranos
    const ingM = getSubWeight('Más ingredientes M');
    if (ingM.weight > 0) {
      score -= 8;
      cons.push(`⚠️ "Más ingredientes M" (Nv. ${ingM.slot}): reduce tiradas de bayas en un especialista puro. (-8 pts)`);
    }
  }

  else if (spec === 'Ingredientes') {
    // Naturaleza
    if (nat?.ingMod && nat.ingMod > 1.0) {
      score += 18;
      pros.push(`🥗 Naturaleza perfecta para Buscar ingredientes (+20%: ${nat.name}). (+18 pts)`);
    } else if (nat?.ingMod && nat.ingMod < 1.0) {
      score -= 24;
      cons.push(`❌ Naturaleza sabotea directamente la búsqueda de ingredientes (-20%: ${nat.name}). (-24 pts)`);
    }

    if (nat?.speedMod && nat.speedMod < 1.0) {
      score += 12;
      pros.push(`⚡ Naturaleza rápida (${nat.name}): acelera la frecuencia de recolección. (+12 pts)`);
    } else if (nat?.speedMod && nat.speedMod > 1.0) {
      score -= 12;
      cons.push(`⚠️ Naturaleza lenta (-10% velocidad: ${nat.name}). (-12 pts)`);
    }

    // Subskills de ingredientes
    const ingM = getSubWeight('Más ingredientes M');
    if (ingM.weight > 0) {
      const pts = Math.round(20 * ingM.weight);
      score += pts;
      pros.push(`🍲 "Más ingredientes M" (Nv. ${ingM.slot}): +36% probabilidad de ingredientes. (+${pts} pts)`);
    }
    const ingS = getSubWeight('Más ingredientes S');
    if (ingS.weight > 0) {
      const pts = Math.round(10 * ingS.weight);
      score += pts;
      pros.push(`🍲 "Más ingredientes S" (Nv. ${ingS.slot}): +18% probabilidad de ingredientes. (+${pts} pts)`);
    }

    // Inventario (Crítico en ingredientes para no perder recursos de noche)
    const invL = getSubWeight('Inventario L');
    const invM = getSubWeight('Inventario M');
    if (invL.weight > 0) {
      const pts = Math.round(8 * invL.weight);
      score += pts;
      pros.push(`🎒 "Inventario L" (Nv. ${invL.slot}, +18 cap.): evita que se sature de noche y deje de recolectar ingredientes. (+${pts} pts)`);
    } else if (invM.weight > 0) {
      const pts = Math.round(5 * invM.weight);
      score += pts;
      pros.push(`🎒 "Inventario M" (Nv. ${invM.slot}, +12 cap.): buena protección contra sobrellenado nocturno. (+${pts} pts)`);
    } else {
      cons.push('⚠️ Sin subhabilidades de inventario: se llenará rápido de noche perdiendo ingredientes.');
    }

    // Consistencia de ingredientes (AAA vs AAB)
    const ing1 = pokemon.ingredients[0]?.name;
    const ing2 = pokemon.ingredients[1]?.name;
    if (ing1 && ing2 && ing1 === ing2) {
      isMonoIngredient = true;
      score += 10;
      pros.push(`🎯 Especialista Mono-ingrediente consistente (${ing1} x2 y x5): ideal para llenar recetas grandes. (+10 pts)`);
    }
  }

  else if (spec === 'Habilidades' || spec === 'Todo') {
    if (spec === 'Todo') {
      score += 16;
      pros.push('🧬 Especialidad Singular "Todo": combina doble baya, alta tasa de skill y volumen de ingredientes. (+16 pts)');
    }

    if (nat?.skillMod && nat.skillMod > 1.0) {
      score += 18;
      pros.push(`✨ Naturaleza ideal para Activar habilidad (+20%: ${nat.name}). (+18 pts)`);
    } else if (nat?.skillMod && nat.skillMod < 1.0) {
      score -= 22;
      cons.push(`❌ Naturaleza penaliza la activación de habilidad principal (-20%: ${nat.name}). (-22 pts)`);
    }

    if (nat?.speedMod && nat.speedMod < 1.0) {
      score += 10;
      pros.push(`⚡ Naturaleza rápida (${nat.name}): genera más tiradas para activar su habilidad. (+10 pts)`);
    } else if (nat?.speedMod && nat.speedMod > 1.0) {
      score -= 10;
      cons.push(`⚠️ Naturaleza lenta (${nat.name}): menos tiradas por hora para activar habilidad. (-10 pts)`);
    }

    const trigM = getSubWeight('Activación M');
    if (trigM.weight > 0) {
      const pts = Math.round(20 * trigM.weight);
      score += pts;
      pros.push(`🎯 "Activación M" (Nv. ${trigM.slot}): +36% probabilidad de activar habilidad principal. (+${pts} pts)`);
    }
    const trigS = getSubWeight('Activación S');
    if (trigS.weight > 0) {
      const pts = Math.round(10 * trigS.weight);
      score += pts;
      pros.push(`🎯 "Activación S" (Nv. ${trigS.slot}): +18% probabilidad de activar habilidad. (+${pts} pts)`);
    }

    const lvlL = getSubWeight('Nivel habilidad L');
    const lvlM = getSubWeight('Nivel habilidad M');
    const lvlS = getSubWeight('Nivel habilidad S');
    if (lvlL.weight > 0) {
      const pts = Math.round(18 * lvlL.weight);
      score += pts;
      pros.push(`🔼 "Nivel habilidad L" (Nv. ${lvlL.slot}): +3 niveles gratis de habilidad principal. (+${pts} pts)`);
    } else if (lvlM.weight > 0) {
      const pts = Math.round(14 * lvlM.weight);
      score += pts;
      pros.push(`🔼 "Nivel habilidad M" (Nv. ${lvlM.slot}): +2 niveles gratis de habilidad principal. (+${pts} pts)`);
    } else if (lvlS.weight > 0) {
      const pts = Math.round(7 * lvlS.weight);
      score += pts;
      pros.push(`🔼 "Nivel habilidad S" (Nv. ${lvlS.slot}): +1 nivel de habilidad principal. (+${pts} pts)`);
    }
  }

  // Bonos pasivos de utilidad
  const expSleep = getSubWeight('Bonus EXP al dormir');
  if (expSleep.weight > 0) {
    score += 6;
    pros.push(`📈 "Bonus EXP al dormir" (Nv. ${expSleep.slot}): +14% EXP al dormir para todo el equipo.`);
  }
  const expResearch = getSubWeight('Bonus EXP de estudio');
  if (expResearch.weight > 0) {
    score += 4;
    pros.push(`📈 "Bonus EXP de estudio" (Nv. ${expResearch.slot}): +6% EXP al rango de estudio del jugador.`);
  }

  // Factor de mitigación de Naturaleza de Recuperación de Energía (-Recuperar energía)
  if (nat?.energyMod && nat.energyMod < 1.0) {
    score -= 4;
    cons.push(`💤 Naturaleza -Recuperar energía (${nat.name}): despierta con menos del 100% si no usas un Sanador en el equipo.`);
  }

  if (isShiny) {
    pros.push('✨ Ejemplar Variocolor (Shiny): valor estético y de colección máximo.');
  }

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    pros,
    cons,
    isMonoIngredient
  };
}

/**
 * Audita la colección completa de la Pokédex del usuario, comparando hermanos de la
 * misma línea evolutiva, protegiendo ejemplares únicos y generando diagnósticos claros.
 */
export function auditPokedexCollection(allPokemons: Pokemon[]): PokemonAuditResult[] {
  // 1. Evaluar genética individual
  const rawEvaluations = allPokemons.map(pokemon => {
    const { score, pros, cons, isMonoIngredient } = evaluateSinglePokemonGenetics(pokemon);
    return { pokemon, score, pros, cons, isMonoIngredient };
  });

  // 2. Mapear cobertura de bayas y familias en la caja para proteger ejemplares únicos
  const berryCoverageCount = new Map<string, number>();
  const familyCount = new Map<string, number>();

  rawEvaluations.forEach(({ pokemon }) => {
    const fam = getPokemonFamilyKey(pokemon.name);
    familyCount.set(fam, (familyCount.get(fam) || 0) + 1);
    berryCoverageCount.set(pokemon.berry, (berryCoverageCount.get(pokemon.berry) || 0) + 1);
  });

  // 3. Asignar Tiers, Veredictos y Detección de Hermanos Superiores
  return rawEvaluations.map(({ pokemon, score, pros, cons, isMonoIngredient }) => {
    const fam = getPokemonFamilyKey(pokemon.name);
    const isShiny = /shiny|variocolor/i.test(pokemon.notes || '');
    const isSpecial = isSpecialPokemon(pokemon);
    const totalInFamily = familyCount.get(fam) || 1;
    const totalBerryUsers = berryCoverageCount.get(pokemon.berry) || 1;

    // Buscar si existe un hermano de la misma familia evolutiva claramente superior (+10 pts)
    const betterSibling = rawEvaluations.find(
      other =>
        other.pokemon.id !== pokemon.id &&
        getPokemonFamilyKey(other.pokemon.name) === fam &&
        other.score >= score + 10
    );

    let tier: PokedexTier = 'C';
    if (score >= 88) tier = 'S+';
    else if (score >= 76) tier = 'S';
    else if (score >= 64) tier = 'A';
    else if (score >= 50) tier = 'B';
    else if (score >= 38) tier = 'C';
    else tier = 'D';

    let verdict: PokedexVerdict = 'UTIL_NICHO';
    let verdictLabel = '🛠️ Útil de Nicho / Rotación';
    let verdictBadgeColor = 'bg-slate-700/80 text-slate-200 border-slate-600';
    let recommendation = '';

    if (isShiny || isSpecial) {
      verdict = 'TROFEO_CONSERVAR';
      verdictLabel = isShiny ? '✨ Trofeo Shiny (Conservar)' : '🌟 Singular / Legendario (Conservar)';
      verdictBadgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
      recommendation = isShiny
        ? 'Ejemplar variocolor de altísimo valor coleccionable. Intocable para transferir; consérvalo con orgullo.'
        : 'Espécimen singular/legendario de evento único. Consérvalo en tu equipo para aprovechar su habilidad especial.';
    } else if (score >= 72 && pokemon.level >= 20) {
      verdict = 'TITULAR_ELITE';
      verdictLabel = '👑 Titular Élite (Top de tu Pokédex)';
      verdictBadgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';
      recommendation = 'Excelente espécimen competitivo con nivel alto. Es titular indiscutible en su isla o tipo de receta.';
    } else if (score >= 66 && pokemon.level < 20) {
      verdict = 'PROMESA_INVERTIR';
      verdictLabel = '💎 Promesa Top (Invertir Caramelos)';
      verdictBadgeColor = 'bg-sky-500/20 text-sky-300 border-sky-400/40';
      recommendation = `Genética de grado ${tier} de altísimo potencial. Prioriza tus caramelos y fragmentos de sueño en subirlo a Nv. 25/30 para desbloquear todo su poder.`;
    } else if (betterSibling && score < 65) {
      verdict = 'CAMBIAR_CARAMELOS';
      verdictLabel = '🍬 Enviar al Profesor (Duplicado Inferior)';
      verdictBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      cons.push(`🔄 Tienes a ${betterSibling.pokemon.name} (Nv. ${betterSibling.pokemon.level}) con mejor genética (${betterSibling.score} pts vs tus ${score} pts).`);
      recommendation = `No inviertas recursos en él. Envíalo al Profesor para obtener caramelos y potenciar directamente a tu ${betterSibling.pokemon.name} superior.`;
    } else if (score < 42 && (totalInFamily > 1 || totalBerryUsers > 2)) {
      verdict = 'CAMBIAR_CARAMELOS';
      verdictLabel = '🍬 Enviar al Profesor (Genética Saboteada)';
      verdictBadgeColor = 'bg-rose-500/20 text-rose-300 border-rose-400/40';
      recommendation = 'Su naturaleza o subhabilidades sabotean directamente su rol principal. Conviértelo en caramelos para liberar espacio en tu caja.';
    } else if (score < 50 && totalInFamily === 1) {
      verdict = 'UTIL_TEMPORAL';
      verdictLabel = '⚠️ Genética Débil (Conservar por Cobertura)';
      verdictBadgeColor = 'bg-amber-500/15 text-amber-200 border-amber-400/30';
      pros.push('📌 Es tu único ejemplar de esta línea/baya.');
      recommendation = 'Su genética es baja, pero al ser tu único ejemplar de esta baya o especie, no lo descartes aún. Consérvalo hasta reclutar un reemplazo digno.';
    } else {
      recommendation = 'Espécimen equilibrado. Útil como relevo secundario cuando tus titulares necesiten rotar o en recetas específicas.';
    }

    return {
      pokemon,
      geneticScore: score,
      tier,
      verdict,
      verdictLabel,
      verdictBadgeColor,
      pros,
      cons,
      recommendation,
      betterDuplicateName: betterSibling?.pokemon.name,
      isMonoIngredient
    };
  }).sort((a, b) => b.geneticScore - a.geneticScore);
}
