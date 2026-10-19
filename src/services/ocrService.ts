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

/**
 * Resizes and compresses an image to max 1280px maintaining aspect ratio
 * Returns base64 JPEG string optimized for fast network transport (<200KB)
 */
export async function compressScreenshot(file: File | Blob, maxWidth = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);
        // High quality JPEG compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
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

  // 7. Ingredients
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
        if (canonicalIng) ing1Name = canonicalIng;
        if (item.count > 0) ing1Count = item.count;
      } else if (item.slot === 2 || item.unlockLevel === 30) {
        if (canonicalIng) ing2Name = canonicalIng;
        if (item.count > 0) ing2Count = item.count;
      } else if (item.slot === 3 || item.unlockLevel === 60) {
        if (canonicalIng) ing3Name = canonicalIng;
        if (item.count > 0) ing3Count = item.count;
      }
    }
  }

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
 * Primary function: Takes a screenshot image and scans it via serverless API or direct Gemini
 */
export async function scanPokemonScreenshot(
  imageFile: File | Blob,
  customApiKey?: string
): Promise<PreFilledPokemonData> {
  // 1. Compress image in browser for ultra-fast upload (<200KB)
  const base64Data = await compressScreenshot(imageFile);

  // 2. Check for custom API key in argument or localStorage
  const savedApiKey =
    customApiKey ||
    (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || undefined : undefined);

  // 3. Attempt Serverless endpoint first
  try {
    const response = await fetch('/api/scan-pokemon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64: base64Data,
        mimeType: 'image/jpeg',
        apiKey: savedApiKey
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.data) {
        return normalizeOcrPokemonData(resData.data);
      }
    }

    const errJson = await response.json().catch(() => ({}));

    // If serverless reports missing API key and we have a client key, fallback to direct client call
    if (errJson.error === 'MISSING_API_KEY') {
      if (savedApiKey) {
        return await callGeminiDirectly(base64Data, savedApiKey);
      }
      throw new Error(
        'Se requiere una API Key de Google AI Studio (Gemini Flash). Puedes configurarla en el botón de ajustes del escáner.'
      );
    }

    if (errJson.message) {
      throw new Error(errJson.message);
    }
  } catch (err: any) {
    // If the server route returned an error or 404, but we have a saved client API key, try direct client call
    if (savedApiKey) {
      return await callGeminiDirectly(base64Data, savedApiKey);
    }
    throw err;
  }

  throw new Error('No se pudo procesar la captura con el servicio de IA.');
}

/**
 * Fallback direct client call to Google AI Studio if running on static hosting without serverless functions
 */
async function callGeminiDirectly(base64Data: string, apiKey: string): Promise<PreFilledPokemonData> {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  const systemPrompt = `You are an expert OCR vision AI specialized in extracting data from "Pokémon Sleep" mobile screenshots.
Analyze the provided screenshot of a Pokémon summary screen and extract all fields into strict JSON format with no markdown wrappers or codeblocks.

Expected JSON Schema:
{
  "name": string,              // Official species name in Spanish or English (e.g. "Ribombee", "Pikachu", "Gastly", "Slowpoke", "Charizard")
  "isShiny": boolean,          // true if there is a golden sparkles / star icon near the name or avatar, else false
  "level": number,             // integer level (e.g. 20, 33, 50)
  "rp": number,                // total RP / PA (Puntos de Ayuda, e.g. 989, 1420, 2723)
  "nature": string,            // nature name (e.g. "Audaz", "Huraña", "Firme", "Alegre", "Adamant", "Modest", etc.)
  "mainSkillName": string,     // main skill name if visible (e.g. "Afortunado", "Imán ingredientes S", "Carga vigor S")
  "mainSkillLevel": number,    // main skill level (integer 1-7, default 1)
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

  async function getAvailableModels(key: string): Promise<string[]> {
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (listRes.ok) {
        const listData = await listRes.json();
        if (Array.isArray(listData.models)) {
          const supported = listData.models
            .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''));

          const score = (name: string) => {
            const lower = name.toLowerCase();
            if (lower.includes('2.5-flash')) return 100;
            if (lower.includes('2.0-flash')) return 90;
            if (lower.includes('1.5-flash')) return 80;
            if (lower.includes('flash')) return 70;
            if (lower.includes('2.5-pro')) return 60;
            if (lower.includes('2.0-pro')) return 50;
            if (lower.includes('1.5-pro')) return 40;
            return 10;
          };

          const sorted = supported.sort((a: string, b: string) => score(b) - score(a));
          if (sorted.length > 0) return sorted;
        }
      }
    } catch (e) {}

    return [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
  }

  const candidateModels = await getAvailableModels(apiKey);
  let lastError: any = null;

  for (const model of candidateModels) {
    const cleanModel = model.replace(/^models\//, '');
    for (const apiVer of ['v1beta', 'v1']) {
      try {
        const url = `https://generativelanguage.googleapis.com/${apiVer}/models/${cleanModel}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: cleanBase64
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${response.status}`);
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
  }

  throw new Error(`Error de Google AI Studio: ${lastError?.message || 'No se pudo generar respuesta'}`);
}
