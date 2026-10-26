import { getSpeciesMasterData, MasterSpecies } from '../data/speciesMaster';
import { normalizeIngredientName, parseNature, KNOWN_SUBSKILLS, NATURES } from '../data/gameData';
import { formatFrequencySeconds } from '../services/evolutionService';
import { normalizeMainSkillName } from './pokeApiService';
import { Specialty } from '../types/pokemon';

export interface RawOcrData {
  name: string;
  isShiny?: boolean;
  level?: number;
  rp?: number;
  nature?: string;
  mainSkillName?: string;
  mainSkillLevel?: number;
  carryLimit?: number;
  ingredients?: Array<{
    slot: number;
    unlockLevel?: number;
    name: string;
    count: number;
  }>;
  subskills?: Array<{
    slot: number;
    unlockLevel?: number;
    name: string;
  }>;
}

export interface PreFilledPokemonData {
  name: string;
  isShiny: boolean;
  level: number;
  rp: number;
  specialty: Specialty;
  berry: string;
  natureName: string;
  mainSkillName: string;
  mainSkillLevel: number;
  carryLimit?: number;
  frequencyStr: string;
  ing1Name: string;
  ing1Count: number;
  ing2Name: string;
  ing2Count: number;
  ing3Name: string;
  ing3Count: number;
  subskills: string[]; // 5 items
  notes: string;
  matchedMaster?: MasterSpecies;
}

export const STORAGE_KEY_GEMINI_KEY = 'pokesleep_gemini_api_key';

export type ScanProgressStage = 'compressing' | 'uploading' | 'analyzing' | 'validating' | 'done';

export type ScanProgressCallback = (
  percent: number,
  status: string,
  stage: ScanProgressStage
) => void;

/**
 * Gemini Vision Single-Tile Threshold:
 * Gemini splits images >768px into multiple 768x768 tiles (258 tokens each).
 * Keeping maxDimension = 768 ensures 1 screenshot (~350x768) OR 2 side-by-side portrait
 * screenshots (~708x768) fit inside ONE SINGLE 768x768 ViT tile (258 tokens total instead of 1,548!).
 */
const SINGLE_TILE_MAX_DIM = 768;
const DEFAULT_JPEG_QUALITY = 0.82;

interface CompressedCanvasEntry {
  dataUrl: string;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

const compressedBlobCache = new WeakMap<Blob, Promise<CompressedCanvasEntry>>();

async function decodeImageSource(
  file: File | Blob
): Promise<{ source: CanvasImageSource; width: number; height: number; cleanup: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close()
      };
    } catch {
      // Fallback to HTMLImageElement if createImageBitmap fails on exotic format
    }
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(objectUrl)
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo decodificar la imagen seleccionada.'));
    };
    img.src = objectUrl;
  });
}

async function compressScreenshotToEntry(
  file: File | Blob,
  maxDimension = SINGLE_TILE_MAX_DIM,
  quality = DEFAULT_JPEG_QUALITY
): Promise<CompressedCanvasEntry> {
  const isDefaultConfig = maxDimension === SINGLE_TILE_MAX_DIM && quality === DEFAULT_JPEG_QUALITY;
  if (isDefaultConfig) {
    const cached = compressedBlobCache.get(file);
    if (cached) return cached;
  }

  const job = (async (): Promise<CompressedCanvasEntry> => {
    const decoded = await decodeImageSource(file);
    try {
      let { width, height } = decoded;
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.max(1, Math.round((height * maxDimension) / width));
          width = maxDimension;
        } else {
          width = Math.max(1, Math.round((width * maxDimension) / height));
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(decoded.source, 0, 0, width, height);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      return { dataUrl, canvas, width, height };
    } finally {
      decoded.cleanup();
    }
  })();

  if (isDefaultConfig) {
    compressedBlobCache.set(file, job);
    job.catch(() => compressedBlobCache.delete(file));
  }

  return job;
}

/**
 * Resizes and compresses an image to max 768px maintaining aspect ratio (~35 KB JPEG).
 * Uses off-thread createImageBitmap + WeakMap memoization for near-0ms repeat access.
 */
export async function compressScreenshot(
  file: File | Blob,
  maxDimension = SINGLE_TILE_MAX_DIM,
  quality = DEFAULT_JPEG_QUALITY
): Promise<string> {
  const entry = await compressScreenshotToEntry(file, maxDimension, quality);
  return entry.dataUrl;
}

/**
 * Pre-warms screenshot compression in the background as soon as the user selects/pastes files,
 * eliminating local compression latency when clicking "Analizar con IA".
 */
export function prewarmScreenshotCompression(files: (File | Blob)[]): void {
  if (typeof window === 'undefined') return;
  for (const file of files) {
    compressScreenshotToEntry(file).catch(() => {
      // Ignore background prewarm errors; handled on explicit scan
    });
  }
}

/**
 * Prepares 1 or 2 screenshots for Gemini Vision.
 * When 2 portrait phone screenshots fit side-by-side within 768x768 (e.g. 348 + 8 + 348 = 704x768),
 * fuses them onto a single canvas so Gemini encodes BOTH screens in 1 single 258-token ViT tile!
 */
async function prepareVisionPayloads(files: (File | Blob)[]): Promise<string[]> {
  const entries = await Promise.all(files.map((f) => compressScreenshotToEntry(f)));
  if (entries.length === 2) {
    const [left, right] = entries;
    const gap = 8;
    const combinedWidth = left.width + gap + right.width;
    const combinedHeight = Math.max(left.height, right.height);

    if (combinedWidth <= SINGLE_TILE_MAX_DIM && combinedHeight <= SINGLE_TILE_MAX_DIM) {
      const stitched = document.createElement('canvas');
      stitched.width = combinedWidth;
      stitched.height = combinedHeight;
      const ctx = stitched.getContext('2d', { alpha: false });
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, combinedWidth, combinedHeight);
        ctx.drawImage(left.canvas, 0, 0);
        ctx.drawImage(right.canvas, left.width + gap, 0);
        return [stitched.toDataURL('image/jpeg', DEFAULT_JPEG_QUALITY)];
      }
    }
  }
  return entries.map((e) => e.dataUrl);
}

/**
 * Normalizes fuzzy subskill text to the exact canonical subskill key in KNOWN_SUBSKILLS
 */
export function matchCanonicalSubskill(rawName: string): string {
  if (!rawName) return '';
  const clean = rawName.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/g, '').trim();

  // 1. Direct key match
  for (const key of Object.keys(KNOWN_SUBSKILLS)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/g, '').trim();
    if (cleanKey === clean) return key;
  }

  // 2. Common aliases & typos in OCR
  const aliasMap: Record<string, string> = {
    'buscabayas': 'Busca bayas S',
    'buscabayass': 'Busca bayas S',
    'berryfindings': 'Busca bayas S',
    'helpingbonus': 'Bonus ayuda',
    'bonusayuda': 'Bonus ayuda',
    'velocidadayudas': 'Velocidad ayuda S',
    'velocidadayudam': 'Velocidad ayuda M',
    'velocidaddeayudas': 'Velocidad ayuda S',
    'velocidaddeayudam': 'Velocidad ayuda M',
    'helpingspeeds': 'Velocidad ayuda S',
    'helpingspeedm': 'Velocidad ayuda M',
    'masingredientes': 'Más ingredientes S',
    'masingredientess': 'Más ingredientes S',
    'masingredientesm': 'Más ingredientes M',
    'ingredientfinders': 'Más ingredientes S',
    'ingredientfinderm': 'Más ingredientes M',
    'activacions': 'Activación S',
    'activacionm': 'Activación M',
    'skilltriggers': 'Activación S',
    'skilltriggerm': 'Activación M',
    'inventarios': 'Inventario S',
    'inventariom': 'Inventario M',
    'inventariol': 'Inventario L',
    'inventoryups': 'Inventario S',
    'inventoryupm': 'Inventario M',
    'inventoryupl': 'Inventario L',
    'nivelhabilidads': 'Nivel habilidad S',
    'nivelhabilidadm': 'Nivel habilidad M',
    'nivelhabilidadl': 'Nivel habilidad L',
    'skilllevels': 'Nivel habilidad S',
    'skilllevelm': 'Nivel habilidad M',
    'skilllevell': 'Nivel habilidad L',
    'bonusexpaldormir': 'Bonus EXP al dormir',
    'sleepexpbonus': 'Bonus EXP al dormir',
    'bonusexpdeestudio': 'Bonus EXP de estudio',
    'researchexpbonus': 'Bonus EXP de estudio',
    'bonusfragmentossuenos': 'Bonus fragmentos sueños',
    'dreamshardbonus': 'Bonus fragmentos sueños',
    'bonusrecuperaenergia': 'Bonus recupera energía',
    'energyrecoverybonus': 'Bonus recupera energía'
  };

  for (const [alias, canonical] of Object.entries(aliasMap)) {
    if (clean.includes(alias) || alias.includes(clean)) {
      return canonical;
    }
  }

  // 3. Substring match
  for (const key of Object.keys(KNOWN_SUBSKILLS)) {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9áéíóúüñ]/g, '').trim();
    if (clean.includes(cleanKey) || cleanKey.includes(clean)) return key;
  }

  return rawName.trim();
}

/**
 * Calculates dynamic frequency considering base frequency, level, and nature
 */
function calculateDynamicFrequency(baseFrequency: number, lvl: number, natureName: string): string {
  const nat = NATURES[natureName];
  let speedMod = 1.0;
  if (nat?.upStat === 'Rapidez de ayuda' || nat?.upStat === 'Velocidad de ayuda') speedMod = 0.90;
  if (nat?.downStat === 'Rapidez de ayuda' || nat?.downStat === 'Velocidad de ayuda') speedMod = 1.10;
  const levelMod = Math.max(0.60, 1 - (lvl - 1) * 0.002);
  const totalSeconds = Math.round(baseFrequency * levelMod * speedMod);
  return formatFrequencySeconds(totalSeconds);
}

/**
 * Transforms raw OCR JSON into a rich, fully populated Pokemon form ready for PokemonModal
 */
export function normalizeOcrPokemonData(raw: RawOcrData): PreFilledPokemonData {
  // 1. Resolve master species
  const matchedMaster = getSpeciesMasterData(raw.name || '');
  const canonicalName = matchedMaster ? matchedMaster.name : (raw.name?.trim() || 'Pikachu');

  // 2. Level & RP
  const level = typeof raw.level === 'number' && raw.level >= 1 && raw.level <= 100 ? raw.level : 25;
  const rp = typeof raw.rp === 'number' && raw.rp > 0 ? raw.rp : 1000;

  // 3. Nature
  const parsedNat = parseNature(raw.nature || 'Dócil');
  const natureName = parsedNat.name || 'Dócil';

  // 4. Specialty & Berry
  const specialty: Specialty = matchedMaster ? matchedMaster.specialty : 'Bayas';
  const berry = matchedMaster ? matchedMaster.berry : 'Baya Caquic';

  // 5. Main Skill
  const rawSkillName = raw.mainSkillName?.trim() || matchedMaster?.mainSkill || 'Carga vigor S';
  const mainSkillName = normalizeMainSkillName(rawSkillName);
  const mainSkillLevel = typeof raw.mainSkillLevel === 'number' && raw.mainSkillLevel >= 1 ? raw.mainSkillLevel : 1;

  // 6. Frequency
  const baseFreq = matchedMaster ? matchedMaster.baseFrequency : 3600;
  const frequencyStr = calculateDynamicFrequency(baseFreq, level, natureName);

  // 7. Candado Canónico de Ingredientes contra alucinaciones visuales de iconos OCR
  const legalIngredients = matchedMaster?.ingredients || [];

  function snapToLegalIngredient(candidate: string, slotIdx: 1 | 2 | 3): string {
    if (legalIngredients.length === 0) return candidate || 'Manzana Selecta';
    if (legalIngredients.includes(candidate)) return candidate;

    // Fuzzy substring match against species' official 3 legal ingredients
    const cleanCand = candidate.toLowerCase();
    for (const legal of legalIngredients) {
      if (cleanCand.includes(legal.toLowerCase()) || legal.toLowerCase().includes(cleanCand)) {
        return legal;
      }
    }

    // Default to species slot canonical ingredient if OCR misidentified icon
    if (slotIdx === 1) return matchedMaster?.ingredientSlots?.slot1?.name || legalIngredients[0];
    if (slotIdx === 2) return matchedMaster?.ingredientSlots?.slot2?.name || legalIngredients[1] || legalIngredients[0];
    return matchedMaster?.ingredientSlots?.slot3?.name || legalIngredients[2] || legalIngredients[0];
  }

  let ing1Name = matchedMaster?.ingredientSlots?.slot1?.name || 'Manzana Selecta';
  let ing1Count = matchedMaster?.ingredientSlots?.slot1?.c1 || 1;

  let ing2Name = matchedMaster?.ingredientSlots?.slot2?.name || ing1Name;
  let ing2Count = matchedMaster?.ingredientSlots?.slot2?.c2 || 2;

  let ing3Name = matchedMaster?.ingredientSlots?.slot3?.name || ing2Name;
  let ing3Count = matchedMaster?.ingredientSlots?.slot3?.c3 || 3;

  if (Array.isArray(raw.ingredients)) {
    for (const item of raw.ingredients) {
      const canonicalIng = normalizeIngredientName(item.name || '');
      if (item.slot === 1 || item.unlockLevel === 1) {
        if (canonicalIng) ing1Name = snapToLegalIngredient(canonicalIng, 1);
        if (item.count > 0) ing1Count = item.count;
      } else if (item.slot === 2 || item.unlockLevel === 30) {
        if (canonicalIng) ing2Name = snapToLegalIngredient(canonicalIng, 2);
        if (item.count > 0) ing2Count = item.count;
      } else if (item.slot === 3 || item.unlockLevel === 60) {
        if (canonicalIng) ing3Name = snapToLegalIngredient(canonicalIng, 3);
        if (item.count > 0) ing3Count = item.count;
      }
    }
  }

  // Double check all 3 ingredients are legal for this species
  ing1Name = snapToLegalIngredient(ing1Name, 1);
  ing2Name = snapToLegalIngredient(ing2Name, 2);
  ing3Name = snapToLegalIngredient(ing3Name, 3);

  // 8. Subskills (5 slots)
  const subskillsList: string[] = ['', '', '', '', ''];
  if (Array.isArray(raw.subskills)) {
    raw.subskills.forEach((sub, idx) => {
      let targetIdx = idx;
      if (sub.slot && sub.slot >= 1 && sub.slot <= 5) {
        targetIdx = sub.slot - 1;
      } else if (sub.unlockLevel) {
        const lvlMap: Record<number, number> = { 10: 0, 25: 1, 50: 2, 75: 3, 100: 4 };
        if (lvlMap[sub.unlockLevel] !== undefined) targetIdx = lvlMap[sub.unlockLevel];
      }
      if (targetIdx >= 0 && targetIdx < 5) {
        subskillsList[targetIdx] = matchCanonicalSubskill(sub.name || '');
      }
    });
  }

  // 9. Capacidad de la bolsa (Inventario)
  let carryLimit = typeof raw.carryLimit === 'number' && raw.carryLimit > 0 ? raw.carryLimit : 0;
  if (!carryLimit) {
    const baseCarry = matchedMaster ? matchedMaster.carryLimit : 15;
    let extraCarry = 0;
    subskillsList.forEach((sub) => {
      if (sub === 'Inventario S') extraCarry += 6;
      if (sub === 'Inventario M') extraCarry += 12;
      if (sub === 'Inventario L') extraCarry += 18;
    });
    carryLimit = baseCarry + extraCarry;
  }

  return {
    name: canonicalName,
    isShiny: Boolean(raw.isShiny),
    level,
    rp,
    specialty,
    berry,
    natureName,
    mainSkillName,
    mainSkillLevel,
    carryLimit,
    frequencyStr,
    ing1Name,
    ing1Count,
    ing2Name,
    ing2Count,
    ing3Name,
    ing3Count,
    subskills: subskillsList,
    notes: raw.isShiny ? 'Variocolor capturado en Pokémon Sleep ✨' : '',
    matchedMaster
  };
}

// ============================================================================
// SHARED HIGH-SPEED GEMINI VISION ENGINE (CLIENT + FALLBACK COORDINATION)
// ============================================================================

const GEMINI_MODELS_CACHE_KEY = 'gemini_active_vision_models_v6';

export const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest'
];

const POKEMON_SYSTEM_PROMPT = `Extract Pokémon Sleep summary data from the image(s) into JSON.
If the image contains 2 side-by-side or separate views (top stats + scrolled subskills/ingredients), merge all visible data for this single Pokémon.
Rules:
- name: species name; if top header is cut off, read candy text ("Caramelos <Name>" or "<Name> Candy").
- isShiny: true only if golden sparkle/star icon is visible near name/avatar.
- Read integer level, rp (PR/PA/RP), nature, mainSkillName, mainSkillLevel (1-7), carryLimit (bag size).
- ingredients: up to 3 slots (slot 1 lv1, slot 2 lv30, slot 3 lv60) with name and integer count (x1, x2, x4...).
- subskills: up to 5 slots (slot 1 lv10, slot 2 lv25, slot 3 lv50, slot 4 lv75, slot 5 lv100) with exact badge text.`;

const POKEMON_OCR_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    isShiny: { type: 'BOOLEAN' },
    level: { type: 'INTEGER' },
    rp: { type: 'INTEGER' },
    nature: { type: 'STRING' },
    mainSkillName: { type: 'STRING' },
    mainSkillLevel: { type: 'INTEGER' },
    carryLimit: { type: 'INTEGER' },
    ingredients: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          slot: { type: 'INTEGER' },
          unlockLevel: { type: 'INTEGER' },
          name: { type: 'STRING' },
          count: { type: 'INTEGER' }
        },
        required: ['slot', 'name', 'count']
      }
    },
    subskills: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          slot: { type: 'INTEGER' },
          unlockLevel: { type: 'INTEGER' },
          name: { type: 'STRING' }
        },
        required: ['slot', 'name']
      }
    }
  },
  required: ['name']
};

const POT_SYSTEM_PROMPT = `Extract Pokémon Sleep cooking pot & ingredient stock from the image(s) into JSON.
Rules:
- potCapacity: second integer Y in "Añadido: X/Y" or "Added: X/Y" (default 57 if hidden); currentAdded = X.
- dishType: "curry", "salad", or "dessert" if visible, else null.
- ingredients: read every ingredient card in the grid. Counter "A/B" means available quantity = B (the denominator AFTER the slash!). Deduplicate across scrolled views.
Canonical Spanish names: Puerro Grueso, Seta Sabrosa, Huevo Selecto, Patata, Manzana Selecta, Hierba Picante, Fiambre Vegetariano, Leche Mu-mu, Miel, Aceite Puro, Jengibre, Siestomate, Cacao Relajante, Cola de Slowpoke, Soja Verdegal, Maíz Verdegal, Café Estimulante, Calabaza Suculenta, Aguacate.`;

const POT_OCR_SCHEMA = {
  type: 'OBJECT',
  properties: {
    potCapacity: { type: 'INTEGER' },
    currentAdded: { type: 'INTEGER' },
    dishType: { type: 'STRING', nullable: true },
    ingredients: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          quantity: { type: 'INTEGER' }
        },
        required: ['name', 'quantity']
      }
    }
  },
  required: ['potCapacity', 'ingredients']
};

/**
 * Cross-browser fetch with AbortController timeout and optional user cancel signal.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  externalSignal?: AbortSignal
): Promise<Response> {
  if (externalSignal?.aborted) {
    const abortErr = new Error('Escaneo cancelado por el usuario.');
    abortErr.name = 'AbortError';
    throw abortErr;
  }

  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const onExternalAbort = () => {
    clearTimeout(timer);
    controller.abort();
  };
  externalSignal?.addEventListener('abort', onExternalAbort, { once: true });

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (externalSignal?.aborted) {
      const abortErr = new Error('Escaneo cancelado por el usuario.');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    if (timedOut) {
      throw new Error(`Tiempo de espera agotado (${Math.round(timeoutMs / 1000)}s).`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

/**
 * Strict filter & ranker for /v1beta/models so we ONLY keep top 2 fast multimodal Flash models
 * and NEVER loop over TTS, audio, live, thinking, Pro, or retired 1.x / 2.0 models.
 */
function filterAndRankVisionModels(modelsList: any[]): string[] {
  const excludedTokens = [
    '2.5-flash-lite',
    '2.5-flash',
    '2.0-',
    '1.5-',
    '1.0-',
    'embedding',
    'aqa',
    'imagen',
    'learnlm',
    'tts',
    'audio',
    'live',
    'thinking',
    'robotics',
    'computer-use',
    'image',
    'veo',
    'gemma',
    'pro',
    'customtools'
  ];

  const valid = modelsList
    .filter((m: any) => {
      const name = String(m?.name || '').replace(/^models\//, '').toLowerCase();
      const methods: string[] = m?.supportedGenerationMethods || [];
      if (!methods.includes('generateContent')) return false;
      if (!name.startsWith('gemini-') || !name.includes('flash')) return false;
      return !excludedTokens.some((tok) => name.includes(tok));
    })
    .map((m: any) => String(m.name).replace(/^models\//, ''));

  valid.sort((a, b) => {
    const aLow = a.toLowerCase();
    const bLow = b.toLowerCase();

    // 1. Prefer Flash-Lite (zero thinking overhead, lowest latency)
    const aLite = aLow.includes('lite') ? 1 : 0;
    const bLite = bLow.includes('lite') ? 1 : 0;
    if (bLite !== aLite) return bLite - aLite;

    // 2. Prefer stable GA releases over preview/experimental
    const aStable = !aLow.includes('preview') && !aLow.includes('exp') ? 1 : 0;
    const bStable = !bLow.includes('preview') && !bLow.includes('exp') ? 1 : 0;
    if (bStable !== aStable) return bStable - aStable;

    // 3. Prefer newer major.minor Gemini version (e.g. 3.5 > 2.5)
    const vA = parseFloat((aLow.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
    const vB = parseFloat((bLow.match(/gemini-(\d+(?:\.\d+)?)/) || [])[1] || '0');
    return vB - vA;
  });

  return Array.from(new Set(valid)).slice(0, 3);
}

/**
 * Extracts Google's explicit replacement model suggestion from deprecation error messages,
 * e.g. "Please update your code to use models/gemini-3.5-flash-lite" -> "gemini-3.5-flash-lite" (0ms!)
 */
function extractSuggestedModelFromError(errMsg: string, failedModel: string): string | null {
  if (!errMsg) return null;
  const regex = /models\/(gemini-[a-z0-9.-]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(errMsg)) !== null) {
    const candidate = match[1].replace(/\.$/, '');
    if (
      candidate &&
      candidate !== failedModel &&
      !candidate.includes('2.5-flash-lite') &&
      !candidate.includes('2.5-flash') &&
      !candidate.includes('2.0-') &&
      !candidate.includes('1.5-')
    ) {
      return candidate;
    }
  }
  return null;
}

function saveWinningModelToCache(winningModel: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const nextList = [
      winningModel,
      ...DEFAULT_GEMINI_MODELS.filter((m) => m !== winningModel)
    ].slice(0, 3);
    localStorage.setItem(GEMINI_MODELS_CACHE_KEY, JSON.stringify(nextList));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Event-Driven Dynamic Gemini Model Discovery:
 * Keeps the active winning model cached indefinitely (0ms overhead on every scan)
 * until an actual deprecation/404 error from Google triggers a fresh catalog discovery.
 */
export async function resolveGeminiVisionModels(
  apiKey: string,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<string[]> {
  if (!apiKey) return DEFAULT_GEMINI_MODELS;

  if (!forceRefresh && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(GEMINI_MODELS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 3);
        }
      }
    } catch {
      // ignore storage parsing errors
    }
    return DEFAULT_GEMINI_MODELS;
  }

  try {
    const res = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
      { method: 'GET' },
      6000,
      signal
    );
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.models)) {
        const ranked = filterAndRankVisionModels(json.models);
        if (ranked.length > 0) {
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              localStorage.setItem(GEMINI_MODELS_CACHE_KEY, JSON.stringify(ranked));
            } catch {
              // ignore
            }
          }
          return ranked;
        }
      }
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') throw err;
    console.warn('Auto-discovery of Gemini models failed, using defaults:', err);
  }

  return DEFAULT_GEMINI_MODELS;
}

/**
 * Builds model-aware generationConfig:
 * - On *-flash-lite models: DO NOT pass thinkingConfig (Flash-Lite defaults to 0 thinking; passing thinkingLevel activates it!).
 * - On non-lite Gemini 3.x: clamp thinkingLevel to "minimal".
 * - On non-lite Gemini 2.5: disable thinking with thinkingBudget: 0.
 */
function buildGenerationConfig(model: string, schema?: Record<string, any>, minimalFallback = false) {
  if (minimalFallback) {
    return { responseMimeType: 'application/json' };
  }

  const lower = model.toLowerCase();
  const isLite = lower.includes('lite');
  const config: Record<string, any> = {
    responseMimeType: 'application/json',
    maxOutputTokens: isLite ? 900 : 1400
  };

  if (schema) {
    config.responseSchema = schema;
  }

  if (!isLite) {
    if (/gemini-3/.test(lower)) {
      config.thinkingConfig = { thinkingLevel: 'minimal' };
    } else if (/gemini-2\.5/.test(lower)) {
      config.thinkingConfig = { thinkingBudget: 0 };
    }
  }

  return config;
}

/**
 * Safely extracts the JSON text part from Gemini candidates, skipping any `thought: true` parts.
 */
function extractJsonPayloadFromGeminiResponse(data: any): any {
  const parts: any[] = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error('Respuesta vacía del modelo Gemini.');
  }

  let rawText = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (part && !part.thought && typeof part.text === 'string' && part.text.trim()) {
      rawText = part.text;
      break;
    }
  }
  if (!rawText && typeof parts[0]?.text === 'string') {
    rawText = parts[0].text;
  }
  if (!rawText) {
    throw new Error('El modelo no devolvió contenido JSON.');
  }

  const stripped = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(stripped.slice(start, end + 1));
    }
    throw new Error('Formato JSON inválido en la respuesta de IA.');
  }
}

interface FatalApiError extends Error {
  isFatalApiError?: boolean;
}

/**
 * Core direct Google AI Studio vision executor used by BOTH Pokémon and Cooking Pot scanners.
 * Capped strictly at max 3 attempts, instant hint recovery, fast-fail on bad API keys, and 12s per-call timeout.
 */
async function executeDirectGeminiVision(params: {
  base64Images: string[];
  apiKey: string;
  systemPrompt: string;
  schema: Record<string, any>;
  onProgress?: ScanProgressCallback;
  signal?: AbortSignal;
}): Promise<any> {
  const { base64Images, apiKey, systemPrompt, schema, onProgress, signal } = params;
  const cleanKey = apiKey.trim();
  const cleanImages = base64Images.map((b) => b.replace(/^data:image\/[a-zA-Z]+;base64,/, ''));

  const initialModels = await resolveGeminiVisionModels(cleanKey, false, signal);
  const queue: string[] = [...initialModels];
  const tried = new Set<string>();
  let catalogRefreshed = false;
  let lastError: any = null;
  let attempts = 0;
  const MAX_ATTEMPTS = 4;

  while (queue.length > 0 && attempts < MAX_ATTEMPTS) {
    const model = queue.shift()!;
    if (!model || tried.has(model)) continue;
    tried.add(model);
    attempts++;

    for (const minimalFallback of [false, true]) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cleanKey)}`;
        const response = await fetchWithTimeout(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    ...cleanImages.map((data) => ({
                      inline_data: { mime_type: 'image/jpeg', data }
                    }))
                  ]
                }
              ],
              generationConfig: buildGenerationConfig(model, schema, minimalFallback)
            })
          },
          12000,
          signal
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg: string = errData?.error?.message || `HTTP ${response.status}`;
          const lowerMsg = errMsg.toLowerCase();

          // Fast-fail immediately on invalid API key, auth, or quota exhaustion (do not loop models!)
          if (
            response.status === 401 ||
            response.status === 403 ||
            lowerMsg.includes('api_key_invalid') ||
            lowerMsg.includes('api key not valid') ||
            lowerMsg.includes('permission denied')
          ) {
            const authErr: FatalApiError = new Error(
              'Tu API Key de Google AI Studio no es válida o fue revocada. Verifícala en "Configurar clave de IA".'
            );
            authErr.isFatalApiError = true;
            throw authErr;
          }

          const isHighDemand =
            response.status === 503 ||
            lowerMsg.includes('high demand') ||
            lowerMsg.includes('spikes in demand') ||
            lowerMsg.includes('overloaded');

          if (
            !isHighDemand &&
            (response.status === 429 || lowerMsg.includes('quota') || lowerMsg.includes('resource_exhausted'))
          ) {
            const quotaErr: FatalApiError = new Error(
              'Límite gratuito por minuto alcanzado en Google AI Studio. Espera unos segundos e intenta de nuevo.'
            );
            quotaErr.isFatalApiError = true;
            throw quotaErr;
          }

          if (isHighDemand) {
            onProgress?.(45, 'Pico de demanda en modelo Lite. Cambiando a Gemini Flash...', 'uploading');
          }

          // If a new model rejects responseSchema or thinkingConfig (400), retry same model once with minimal config
          if (
            !minimalFallback &&
            response.status === 400 &&
            (lowerMsg.includes('responseschema') ||
              lowerMsg.includes('thinking') ||
              lowerMsg.includes('unknown name'))
          ) {
            continue;
          }

          // Event-Driven Auto-Recovery on deprecated / 404 model
          if (
            lowerMsg.includes('no longer available') ||
            lowerMsg.includes('not found') ||
            lowerMsg.includes('deprecated') ||
            response.status === 404
          ) {
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem(GEMINI_MODELS_CACHE_KEY);
            }

            // 1. Instant 0ms recovery if Google's error names the successor model directly!
            const hintedModel = extractSuggestedModelFromError(errMsg, model);
            if (hintedModel && !tried.has(hintedModel)) {
              onProgress?.(44, `Actualizando automáticamente a ${hintedModel}...`, 'uploading');
              queue.unshift(hintedModel);
            } else if (!catalogRefreshed) {
              // 2. Otherwise query /v1beta/models once (strictly filtered to top 2 Flash models)
              catalogRefreshed = true;
              onProgress?.(42, 'Detectando modelo Flash activo en Google AI Studio...', 'uploading');
              const freshModels = await resolveGeminiVisionModels(cleanKey, true, signal);
              for (let k = freshModels.length - 1; k >= 0; k--) {
                if (!tried.has(freshModels[k])) {
                  queue.unshift(freshModels[k]);
                }
              }
            }
          }

          const modelErr: FatalApiError = new Error(errMsg);
          modelErr.isFatalApiError = true;
          throw modelErr;
        }

        const data = await response.json();
        const parsed = extractJsonPayloadFromGeminiResponse(data);
        saveWinningModelToCache(model);
        return parsed;
      } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        lastError = err;
        // Break inner minimalFallback loop unless we explicitly `continue`d above
        break;
      }
    }

    // Stop immediately on auth / quota errors instead of trying backup models
    if (
      lastError?.message?.includes('API Key') ||
      lastError?.message?.includes('Límite gratuito')
    ) {
      throw lastError;
    }
  }

  const finalErr: FatalApiError = new Error(
    `Error de Google AI Studio: ${lastError?.message || 'No se pudo generar respuesta'}`
  );
  if (lastError?.isFatalApiError) {
    finalErr.isFatalApiError = true;
  }
  throw finalErr;
}

/**
 * Primary function: Takes 1 or 2 Pokémon Sleep summary screenshots and scans them via
 * single-hop direct Gemini Flash-Lite (if personal key exists) or serverless /api/scan-pokemon.
 */
export async function scanPokemonScreenshot(
  imageInput: File | Blob | (File | Blob)[],
  customApiKey?: string,
  onProgress?: ScanProgressCallback,
  signal?: AbortSignal
): Promise<PreFilledPokemonData> {
  const files = Array.isArray(imageInput) ? imageInput : [imageInput];
  if (files.length === 0) {
    throw new Error('No se proporcionó ninguna imagen.');
  }

  onProgress?.(12, 'Preparando captura en mosaico único (768px)...', 'compressing');
  const base64List = await prepareVisionPayloads(files);
  onProgress?.(28, 'Conectando con Gemini 3.5 Flash-Lite...', 'uploading');

  let ticker: ReturnType<typeof setInterval> | null = null;
  let currentPct = 32;
  const startProgressTicker = () => {
    ticker = setInterval(() => {
      currentPct = Math.min(88, currentPct + Math.floor(Math.random() * 6) + 4);
      if (currentPct < 54) {
        onProgress?.(currentPct, 'Gemini Flash-Lite leyendo captura...', 'analyzing');
      } else if (currentPct < 74) {
        onProgress?.(currentPct, 'Extrayendo nivel, PR, naturaleza e ingredientes...', 'analyzing');
      } else {
        onProgress?.(currentPct, 'Detectando subhabilidades (Nv. 10–100)...', 'analyzing');
      }
    }, 350);
  };
  const stopProgressTicker = () => {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  };

  const savedApiKey =
    customApiKey?.trim() ||
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEMINI_KEY)?.trim() || undefined : undefined);

  startProgressTicker();

  try {
    // Fast path: Direct single-hop to Google AI Studio when user has configured an API Key
    if (savedApiKey) {
      try {
        const rawParsed = await executeDirectGeminiVision({
          base64Images: base64List,
          apiKey: savedApiKey,
          systemPrompt: POKEMON_SYSTEM_PROMPT,
          schema: POKEMON_OCR_SCHEMA,
          onProgress,
          signal
        });
        stopProgressTicker();
        onProgress?.(94, 'Validando datos con el Pokédex canónico oficial...', 'validating');
        const normalized = normalizeOcrPokemonData(rawParsed);
        onProgress?.(100, '¡Lectura completada con éxito!', 'done');
        return normalized;
      } catch (directErr: any) {
        // Never double-waterfall if user cancelled or Google already responded with an API error!
        if (directErr?.name === 'AbortError' || directErr?.isFatalApiError) {
          throw directErr;
        }
        console.warn('Direct browser fetch blocked, falling back to /api/scan-pokemon:', directErr);
      }
    }

    // Serverless endpoint path (uses Vercel GEMINI_API_KEY)
    const response = await fetchWithTimeout(
      '/api/scan-pokemon',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64List[0],
          imagesBase64: base64List,
          mimeType: 'image/jpeg',
          apiKey: savedApiKey
        })
      },
      22000,
      signal
    );

    const resData = await response.json().catch(() => ({}));
    if (response.ok && resData.success && resData.data) {
      stopProgressTicker();
      onProgress?.(94, 'Validando datos con el Pokédex canónico oficial...', 'validating');
      const normalized = normalizeOcrPokemonData(resData.data);
      onProgress?.(100, '¡Lectura completada con éxito!', 'done');
      return normalized;
    }

    throw new Error(
      resData.message || resData.error || `Error del servidor HTTP ${response.status}`
    );
  } finally {
    stopProgressTicker();
  }
}

export interface ScannedPotData {
  potCapacity: number;
  currentAdded: number;
  dishType: 'curry' | 'salad' | 'dessert' | null;
  inventory: Record<string, number>;
  rawList: Array<{ name: string; quantity: number }>;
}

/**
 * Normalizes raw OCR pot data: canonicalizes ingredient names and aggregates counts
 */
export function normalizeOcrPotData(raw: any): ScannedPotData {
  const potCapacity = typeof raw.potCapacity === 'number' && raw.potCapacity > 0 ? raw.potCapacity : 57;
  const currentAdded = typeof raw.currentAdded === 'number' ? raw.currentAdded : 0;

  let dishType: 'curry' | 'salad' | 'dessert' | null = null;
  if (raw.dishType) {
    const dt = String(raw.dishType).toLowerCase();
    if (dt.includes('curry') || dt.includes('curri')) dishType = 'curry';
    else if (dt.includes('salad') || dt.includes('ensalada')) dishType = 'salad';
    else if (dt.includes('dessert') || dt.includes('postre') || dt.includes('bebida')) dishType = 'dessert';
  }

  const inventory: Record<string, number> = {};
  const rawList: Array<{ name: string; quantity: number }> = [];

  if (Array.isArray(raw.ingredients)) {
    for (const item of raw.ingredients) {
      if (!item || !item.name) continue;
      const canonical = normalizeIngredientName(item.name);
      const qty = typeof item.quantity === 'number' ? Math.max(0, item.quantity) : 0;

      if (canonical && qty > 0) {
        inventory[canonical] = (inventory[canonical] || 0) + qty;
        rawList.push({ name: canonical, quantity: qty });
      }
    }
  }

  return {
    potCapacity,
    currentAdded,
    dishType,
    inventory,
    rawList
  };
}

/**
 * Scans cooking pot / ingredient selection screenshot(s) using single-hop Gemini Flash-Lite
 * (when client API key exists) or serverless /api/scan-pot.
 */
export async function scanPotScreenshots(
  imageInput: File | Blob | (File | Blob)[],
  customApiKey?: string,
  onProgress?: ScanProgressCallback,
  signal?: AbortSignal
): Promise<ScannedPotData> {
  const files = Array.isArray(imageInput) ? imageInput : [imageInput];
  if (files.length === 0) {
    throw new Error('No se proporcionó ninguna imagen.');
  }

  onProgress?.(12, 'Preparando captura de la olla (768px)...', 'compressing');
  const base64List = await prepareVisionPayloads(files);
  onProgress?.(28, 'Conectando con Gemini 3.5 Flash-Lite...', 'uploading');

  let ticker: ReturnType<typeof setInterval> | null = null;
  let currentPct = 32;
  const startProgressTicker = () => {
    ticker = setInterval(() => {
      currentPct = Math.min(88, currentPct + Math.floor(Math.random() * 6) + 4);
      if (currentPct < 56) {
        onProgress?.(currentPct, 'Gemini Flash-Lite leyendo capacidad de la olla...', 'analyzing');
      } else {
        onProgress?.(currentPct, 'Detectando cuadrícula y cantidades de ingredientes...', 'analyzing');
      }
    }, 350);
  };
  const stopProgressTicker = () => {
    if (ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  };

  const savedApiKey =
    customApiKey?.trim() ||
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEMINI_KEY)?.trim() || undefined : undefined);

  startProgressTicker();

  try {
    // 1. Fast path: Direct single-hop to Google AI Studio when user has configured an API Key
    if (savedApiKey) {
      try {
        const rawParsed = await executeDirectGeminiVision({
          base64Images: base64List,
          apiKey: savedApiKey,
          systemPrompt: POT_SYSTEM_PROMPT,
          schema: POT_OCR_SCHEMA,
          onProgress,
          signal
        });
        stopProgressTicker();
        onProgress?.(94, 'Normalizando inventario de ingredientes...', 'validating');
        const normalized = normalizeOcrPotData(rawParsed);
        onProgress?.(100, '¡Olla escaneada con éxito!', 'done');
        return normalized;
      } catch (directErr: any) {
        if (directErr?.name === 'AbortError' || directErr?.isFatalApiError) {
          throw directErr;
        }
        console.warn('Direct pot OCR blocked, falling back to /api/scan-pot:', directErr);
      }
    }

    // 2. Serverless endpoint /api/scan-pot
    const response = await fetchWithTimeout(
      '/api/scan-pot',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64List[0],
          imagesBase64: base64List,
          mimeType: 'image/jpeg',
          apiKey: savedApiKey
        })
      },
      22000,
      signal
    );

    const resData = await response.json().catch(() => ({}));
    if (response.ok && resData.success && resData.data) {
      stopProgressTicker();
      onProgress?.(94, 'Normalizando inventario de ingredientes...', 'validating');
      const normalized = normalizeOcrPotData(resData.data);
      onProgress?.(100, '¡Olla escaneada con éxito!', 'done');
      return normalized;
    }

    throw new Error(
      resData.message || resData.error || `Error del servidor HTTP ${response.status}`
    );
  } finally {
    stopProgressTicker();
  }
}
