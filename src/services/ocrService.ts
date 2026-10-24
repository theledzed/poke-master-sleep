import { getSpeciesMasterData, MasterSpecies } from '../data/speciesMaster';
import { INGREDIENTS, normalizeIngredientName, parseNature, KNOWN_SUBSKILLS, BERRIES, NATURES } from '../data/gameData';
import { formatFrequencySeconds } from '../services/evolutionService';
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
 * Resizes and compresses an image to max 960px maintaining aspect ratio.
 * Checks both width and height to guarantee lightweight transport (<90KB per mobile screenshot).
 */
export async function compressScreenshot(
  file: File | Blob,
  maxDimension = 960,
  quality = 0.80
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale proportionally checking both width and height
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Ultra fast, high clarity JPEG compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
    reader.readAsDataURL(file);
  });
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
  const mainSkillName = raw.mainSkillName?.trim() || matchedMaster?.mainSkill || 'Carga vigor S';
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

/**
 * Primary function: Takes a screenshot image and scans it via serverless API or direct Gemini.
 * Supports real-time progress callbacks for responsive progress bars.
 */
export async function scanPokemonScreenshot(
  imageInput: File | Blob | (File | Blob)[],
  customApiKey?: string,
  onProgress?: ScanProgressCallback
): Promise<PreFilledPokemonData> {
  const files = Array.isArray(imageInput) ? imageInput : [imageInput];
  if (files.length === 0) {
    throw new Error('No se proporcionó ninguna imagen.');
  }

  // 1. Stage: Compressing (<90KB per image)
  onProgress?.(10, 'Optimizando captura (<100 KB ultra ligero)...', 'compressing');
  const base64List = await Promise.all(files.map((f) => compressScreenshot(f)));
  onProgress?.(28, 'Captura optimizada. Conectando con Gemini 2.0 Flash...', 'uploading');

  // 2. Simulated progress ticker during network inference
  let ticker: any = null;
  let currentPct = 30;
  const startProgressTicker = () => {
    ticker = setInterval(() => {
      currentPct = Math.min(86, currentPct + Math.floor(Math.random() * 7) + 3);
      if (currentPct < 52) {
        onProgress?.(currentPct, 'Gemini 2.0 Flash analizando pantalla...', 'analyzing');
      } else if (currentPct < 72) {
        onProgress?.(currentPct, 'Extrayendo nivel, RP, naturaleza e ingredientes...', 'analyzing');
      } else {
        onProgress?.(currentPct, 'Detectando subhabilidades y sinergias...', 'analyzing');
      }
    }, 400);
  };
  const stopProgressTicker = () => {
    if (ticker) clearInterval(ticker);
  };

  // 3. Check for custom API key in argument or localStorage
  const savedApiKey =
    customApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || undefined : undefined);

  startProgressTicker();

  // 4. Fast path: If client has personal API key, call Google directly (single-hop, no serverless cold-start, <2.5s!)
  if (savedApiKey) {
    try {
      const result = await callGeminiDirectly(base64List, savedApiKey, onProgress);
      stopProgressTicker();
      onProgress?.(100, '¡Lectura completada con éxito!', 'done');
      return result;
    } catch (directErr) {
      console.warn('Direct Google AI Studio call failed, attempting serverless fallback:', directErr);
    }
  }

  // 5. Attempt Serverless endpoint fallback
  try {
    const response = await fetch('/api/scan-pokemon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        imageBase64: base64List[0],
        imagesBase64: base64List,
        mimeType: 'image/jpeg',
        apiKey: savedApiKey
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.data) {
        stopProgressTicker();
        onProgress?.(92, 'Validando datos con el Pokédex canónico oficial...', 'validating');
        const normalized = normalizeOcrPokemonData(resData.data);
        onProgress?.(100, '¡Lectura completada con éxito!', 'done');
        return normalized;
      }
    }

    const errJson = await response.json().catch(() => ({}));
    if (errJson.message) {
      stopProgressTicker();
      throw new Error(errJson.message);
    }
  } catch (err: any) {
    stopProgressTicker();
    throw err;
  }

  stopProgressTicker();
  throw new Error('No se pudo procesar la captura con el servicio de IA.');
}

const GEMINI_MODELS_CACHE_KEY = 'gemini_active_vision_models_v4';

export const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash'
];

/**
 * Event-Driven Dynamic Gemini Model Discovery:
 * Keeps the active model cached indefinitely (0ms overhead on every single scan)
 * until an actual error from Google triggers a fresh catalog discovery.
 */
export async function resolveGeminiVisionModels(
  apiKey: string,
  forceRefresh = false
): Promise<string[]> {
  if (!apiKey) return DEFAULT_GEMINI_MODELS;

  // 1. If not forcing a refresh, return cached models if present, or DEFAULT_GEMINI_MODELS immediately (0ms latency!)
  if (!forceRefresh && typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(GEMINI_MODELS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage parsing errors
    }
    // Zero latency: return defaults without hitting network
    return DEFAULT_GEMINI_MODELS;
  }

  // 2. Only on forceRefresh (triggered by an API error): query Google AI Studio catalog
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.models)) {
        const available = json.models
          .filter((m: any) => {
            const name = (m.name || '').replace('models/', '').toLowerCase();
            const methods = m.supportedGenerationMethods || [];
            return (
              methods.includes('generateContent') &&
              name.includes('gemini') &&
              !name.includes('embedding') &&
              !name.includes('aqa') &&
              !name.includes('imagen') &&
              !name.includes('learnlm')
            );
          })
          .map((m: any) => (m.name || '').replace('models/', ''));

        if (available.length > 0) {
          // Sort: flash-lite models first (lowest latency, zero thinking overhead)
          available.sort((a: string, b: string) => {
            const isALite = a.includes('lite') ? 1 : 0;
            const isBLite = b.includes('lite') ? 1 : 0;
            if (isBLite !== isALite) return isBLite - isALite;

            const isAFlash = a.includes('flash') ? 1 : 0;
            const isBFlash = b.includes('flash') ? 1 : 0;
            if (isBFlash !== isAFlash) return isBFlash - isAFlash;

            const vA = parseFloat((a.match(/gemini-(\d+(?:\.\d+)?)/i) || [])[1] || '1.0');
            const vB = parseFloat((b.match(/gemini-(\d+(?:\.\d+)?)/i) || [])[1] || '1.0');
            return vB - vA;
          });

          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              localStorage.setItem(GEMINI_MODELS_CACHE_KEY, JSON.stringify(available));
            } catch {
              // ignore
            }
          }

          return available;
        }
      }
    }
  } catch (err) {
    console.warn('Auto-discovery of Gemini models failed, falling back to defaults:', err);
  }

  return DEFAULT_GEMINI_MODELS;
}

/**
 * Fallback direct client call to Google AI Studio if running on static hosting without serverless functions.
 * Uses cached dynamic model discovery with error-triggered recovery and progress notification.
 */
async function callGeminiDirectly(
  base64Input: string | string[],
  apiKey: string,
  onProgress?: ScanProgressCallback
): Promise<PreFilledPokemonData> {
  const rawList = Array.isArray(base64Input) ? base64Input : [base64Input];
  const cleanImages = rawList.map((b) => b.replace(/^data:image\/[a-zA-Z]+;base64,/, ''));

  const systemPrompt = `You are an expert OCR vision AI specialized in extracting data from "Pokémon Sleep" mobile screenshots.
You may be provided with 1 or 2 screenshots of the same Pokémon (e.g. top section with Level/RP/Nature and a second scrolled section showing all 5 Subskills and 3 Ingredient slots).
Combine and synthesize all visible information across all provided screenshots to create a single complete JSON representation of the Pokémon.
IMPORTANT RULES:
- SCROLLED SCREENSHOTS: If the top header or Pokémon species name is scrolled off-screen or cut off, look lower down at the candy text (e.g. "Caramelos Gastly", "Caramelos Pikachu", "Pikachu Candy") to accurately determine the species name!
- INGREDIENT ICONS: In Pokémon Sleep, ingredient slots show icons with quantities (e.g. x1, x2, x4). Carefully inspect the shapes and colors of the ingredient icons.

Expected JSON Schema:
{
  "name": string,              // Official species name in Spanish or English (e.g. "Ribombee", "Pikachu", "Gastly", "Slowpoke", "Charizard")
  "isShiny": boolean,          // true if there is a golden sparkles / star icon near the name or avatar, else false
  "level": number,             // integer level (e.g. 20, 33, 50)
  "rp": number,                // total RP / PA (Puntos de Ayuda, e.g. 989, 1420, 2723)
  "nature": string,            // nature name (e.g. "Audaz", "Huraña", "Firme", "Alegre", "Adamant", "Modest", etc.)
  "mainSkillName": string,     // main skill name if visible (e.g. "Afortunado", "Imán ingredientes S", "Carga vigor S")
  "mainSkillLevel": number,    // main skill level (integer 1-7, default 1)
  "carryLimit": number,        // bag / inventory capacity if visible (integer, e.g. 19, 24, 30)
  "ingredients": [             // up to 3 ingredient slots:
    { "slot": 1, "unlockLevel": 1, "name": string, "count": number },
    { "slot": 2, "unlockLevel": 30, "name": string, "count": number },
    { "slot": 3, "unlockLevel": 60, "name": string, "count": number }
  ],
  "subskills": [               // up to 5 subskills unlocked at levels 10, 25, 50, 75, 100:
    { "slot": 1, "unlockLevel": 10, "name": string },
    { "slot": 2, "unlockLevel": 25, "name": string },
    { "slot": 3, "unlockLevel": 50, "name": string },
    { "slot": 4, "unlockLevel": 75, "name": string },
    { "slot": 5, "unlockLevel": 100, "name": string }
  ]
}

Ensure accurate reading of ingredient counts (e.g. x1, x2, x4) and subskill tier names.
Output strictly valid JSON.`;

  // Targeted production models in priority order (Fastest first, with zero-latency event-driven cache)
  let candidateModels = await resolveGeminiVisionModels(apiKey);
  let lastError: any = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                ...cleanImages.map((data) => ({
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data
                  }
                }))
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status}`;

        // Event-Driven Auto-Recovery: If model is deprecated / not available / 404, query catalog and notify progress bar
        if (
          errMsg.includes('no longer available') ||
          errMsg.includes('not found') ||
          errMsg.includes('deprecated') ||
          response.status === 404
        ) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(GEMINI_MODELS_CACHE_KEY);
          }
          if (i === 0) {
            onProgress?.(38, 'Detectando modelo más nuevo de Gemini en Google AI Studio...', 'uploading');
            const freshModels = await resolveGeminiVisionModels(apiKey, true);
            if (freshModels.length > 0 && freshModels[0] !== model) {
              candidateModels = freshModels;
              onProgress?.(50, `Conectando con ${freshModels[0]}...`, 'analyzing');
            }
          }
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        return normalizeOcrPokemonData(parsed);
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw new Error(`Error de Google AI Studio: ${lastError?.message || 'No se pudo generar respuesta'}`);
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
 * Scans cooking pot / ingredient selection screenshot(s) using /api/scan-pot or direct Gemini.
 * Supports real-time progress callbacks for responsive progress bars.
 */
export async function scanPotScreenshots(
  imageInput: File | Blob | (File | Blob)[],
  customApiKey?: string,
  onProgress?: ScanProgressCallback
): Promise<ScannedPotData> {
  const files = Array.isArray(imageInput) ? imageInput : [imageInput];
  if (files.length === 0) {
    throw new Error('No se proporcionó ninguna imagen.');
  }

  onProgress?.(10, 'Optimizando captura de la olla (<100 KB)...', 'compressing');
  const base64List = await Promise.all(files.map((f) => compressScreenshot(f)));
  onProgress?.(28, 'Conectando con Gemini 2.0 Flash...', 'uploading');

  let ticker: any = null;
  let currentPct = 30;
  const startProgressTicker = () => {
    ticker = setInterval(() => {
      currentPct = Math.min(86, currentPct + Math.floor(Math.random() * 7) + 3);
      if (currentPct < 55) {
        onProgress?.(currentPct, 'Gemini 2.0 Flash leyendo capacidad de la olla...', 'analyzing');
      } else {
        onProgress?.(currentPct, 'Detectando cuadrícula y cantidades de ingredientes...', 'analyzing');
      }
    }, 400);
  };
  const stopProgressTicker = () => {
    if (ticker) clearInterval(ticker);
  };

  const savedApiKey =
    customApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || undefined : undefined);

  startProgressTicker();

  // 1. Try serverless endpoint /api/scan-pot
  try {
    const response = await fetch('/api/scan-pot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: base64List[0],
        imagesBase64: base64List,
        mimeType: 'image/jpeg',
        apiKey: savedApiKey
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.data) {
        stopProgressTicker();
        onProgress?.(92, 'Normalizando inventario de ingredientes...', 'validating');
        const normalized = normalizeOcrPotData(resData.data);
        onProgress?.(100, '¡Olla escaneada con éxito!', 'done');
        return normalized;
      }
    }

    const errJson = await response.json().catch(() => ({}));
    if (errJson.error === 'MISSING_API_KEY' && savedApiKey) {
      const result = await callGeminiPotDirectly(base64List, savedApiKey, onProgress);
      stopProgressTicker();
      onProgress?.(100, '¡Olla escaneada con éxito!', 'done');
      return result;
    }

    stopProgressTicker();
    throw new Error(errJson.message || `Error del servidor HTTP ${response.status}`);
  } catch (err: any) {
    if (savedApiKey) {
      try {
        const result = await callGeminiPotDirectly(base64List, savedApiKey, onProgress);
        stopProgressTicker();
        onProgress?.(100, '¡Olla escaneada con éxito!', 'done');
        return result;
      } catch (directErr) {
        stopProgressTicker();
        throw directErr;
      }
    }
    stopProgressTicker();
    throw err;
  }
}

/**
 * Direct client-side Gemini fallback for pot OCR with error-triggered dynamic recovery.
 */
async function callGeminiPotDirectly(
  base64Images: string[],
  apiKey: string,
  onProgress?: ScanProgressCallback
): Promise<ScannedPotData> {
  const cleanImages = base64Images.map(img => img.replace(/^data:image\/[a-zA-Z]+;base64,/, ''));
  const systemPrompt = `You are an expert OCR vision AI specialized in extracting cooking pot and ingredient inventory data from "Pokémon Sleep" mobile screenshots.
Look for the pot capacity in "Añadido: X/Y" (return Y as potCapacity) and list every ingredient in the grid with the quantity after the slash (denominator in "0/X").
Expected JSON: { "potCapacity": number, "currentAdded": number, "dishType": string|null, "ingredients": [{ "name": string, "quantity": number }] }
Output strictly valid JSON.`;

  let models = await resolveGeminiVisionModels(apiKey);
  let lastError: any = null;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15000),
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
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanText);
          return normalizeOcrPotData(parsed);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status}`;
        if (
          errMsg.includes('no longer available') ||
          errMsg.includes('not found') ||
          errMsg.includes('deprecated') ||
          response.status === 404
        ) {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(GEMINI_MODELS_CACHE_KEY);
          }
          if (i === 0) {
            onProgress?.(38, 'Detectando modelo más nuevo de Gemini en Google AI Studio...', 'uploading');
            const fresh = await resolveGeminiVisionModels(apiKey, true);
            if (fresh.length > 0 && fresh[0] !== model) {
              models = fresh;
              onProgress?.(50, `Conectando con ${fresh[0]}...`, 'analyzing');
            }
          }
        }
        lastError = new Error(errMsg);
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw new Error(`Error de Google AI Studio: ${lastError?.message || 'No se pudo procesar la captura de la olla'}`);
}
