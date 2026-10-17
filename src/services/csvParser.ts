import { Pokemon, IngredientSlot, Subskill, Specialty } from '../types/pokemon';
import { KNOWN_SUBSKILLS, normalizeIngredientName, parseNature, BERRIES } from '../data/gameData';
import { getPokemonCanonicalSkill } from './pokeApiService';
import * as XLSX from 'xlsx';

// Parse time strings like "45 min 14s", "1h 5min 29s", "52min 21s"
export function parseFrequency(freqStr: string): number {
  if (!freqStr) return 3000;
  let totalSeconds = 0;
  
  const hMatch = freqStr.match(/(\d+)\s*h/i);
  const mMatch = freqStr.match(/(\d+)\s*min/i);
  const sMatch = freqStr.match(/(\d+)\s*s/i);

  if (hMatch) totalSeconds += parseInt(hMatch[1], 10) * 3600;
  if (mMatch) totalSeconds += parseInt(mMatch[1], 10) * 60;
  if (sMatch) totalSeconds += parseInt(sMatch[1], 10);

  return totalSeconds > 0 ? totalSeconds : 3000;
}

// Parse ingredient list string like "Huevo x2, Hierba Picante x4"
export function parseIngredientSlots(ingStr: string, level: number): IngredientSlot[] {
  if (!ingStr) return [];
  const parts = ingStr.split(',').map(s => s.trim()).filter(Boolean);
  const unlockLevels: (1 | 30 | 60)[] = [1, 30, 60];

  return parts.slice(0, 3).map((part, index) => {
    const unlockLevel = unlockLevels[index] || 60;
    const match = part.match(/(.+?)\s*x\s*(\d+)/i);
    let name = part;
    let count = 1;

    if (match) {
      name = match[1].trim();
      count = parseInt(match[2], 10) || 1;
    }

    const canonicalName = normalizeIngredientName(name);

    return {
      name: canonicalName,
      count,
      unlockLevel,
      enabled: level >= unlockLevel
    };
  });
}

// Parse subskills string like "Nivel habilidad M, Bonus EXP de estudio"
export function parseSubskills(subStr: string, level: number): Subskill[] {
  if (!subStr) return [];
  const parts = subStr.split(',').map(s => s.trim()).filter(Boolean);
  const unlockLevels: (10 | 25 | 50 | 75 | 100)[] = [10, 25, 50, 75, 100];

  return parts.map((part, index) => {
    // Strip annotations like "(Nv. 10)"
    const cleanName = part.replace(/\(Nv\.\s*\d+\)/i, '').trim();
    const meta = KNOWN_SUBSKILLS[cleanName] || { tier: 'white' as const, description: 'Habilidad secundaria' };
    const unlockLevel = unlockLevels[index] || 100;

    return {
      name: cleanName,
      tier: meta.tier,
      description: meta.description,
      unlockLevel,
      enabled: level >= unlockLevel
    };
  });
}

export function parseCsvRows(rows: Record<string, any>[]): Pokemon[] {
  return rows.map((row, index) => {
    // Safely coerce all keys and values to string before trimming
    const cleanRow: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      cleanRow[String(k).trim()] = String(v ?? '').trim();
    }

    const name = cleanRow['Nombre'] || `Pokemon #${index + 1}`;
    const level = parseInt(cleanRow['Nivel'] || '1', 10) || 1;
    const rp = parseInt(cleanRow['PA (Poder de Ayuda)'] || '0', 10) || 0;
    const freqStr = cleanRow['Frecuencia'] || '45 min 0s';
    const frequencySeconds = parseFrequency(freqStr);
    
    const specialtyRaw = cleanRow['Especialidad'] || 'Bayas';
    const specialty: Specialty = (['Bayas', 'Ingredientes', 'Habilidades', 'Todo'].includes(specialtyRaw)) 
      ? specialtyRaw as Specialty 
      : 'Bayas';

    const natureRaw = cleanRow['Naturaleza'] || 'Dócil';
    const natureObj = parseNature(natureRaw);

    const berry = cleanRow['Baya'] || 'Baya Caquic';
    const berryType = BERRIES[berry]?.type || 'Normal';

    const ingredients = parseIngredientSlots(cleanRow['Ingredientes'] || '', level);
    const subskills = parseSubskills(cleanRow['Subhabilidades'] || '', level);

    return {
      id: `poke-${index + 1}-${name.toLowerCase()}`,
      name,
      frequencyStr: freqStr,
      frequencySeconds,
      level,
      rp,
      specialty,
      nature: natureRaw,
      natureObj,
      berry,
      berryType,
      ingredients,
      subskills,
      encounterDate: cleanRow['Fecha de Encuentro'],
      sleepHours: cleanRow['Horas de Sueño'],
      notes: cleanRow['Sinergia / Estrategia'],
      mainSkillName: cleanRow['Habilidad'] || cleanRow['Habilidad Principal'] || getPokemonCanonicalSkill(name)
    };
  });
}

export function parseCsvText(csvText: string): Pokemon[] {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: '' });
  return parseCsvRows(rows);
}

export function parseExcelFile(arrayBuffer: ArrayBuffer): Pokemon[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: '' });
  return parseCsvRows(rows);
}

export function exportPokemonsToCsv(pokemons: Pokemon[]): string {
  const rows = pokemons.map(p => {
    const ingString = p.ingredients.map(ing => `${ing.name} x${ing.count}`).join(', ');
    const subString = p.subskills.map(s => s.name).join(', ');

    return {
      'Nombre': p.name,
      'Frecuencia ': p.frequencyStr,
      'Nivel': p.level,
      'PA (Poder de Ayuda)': p.rp,
      'Especialidad': p.specialty,
      'Naturaleza': p.nature,
      'Ingredientes': ingString,
      'Subhabilidades': subString,
      'Fecha de Encuentro': p.encounterDate || '',
      'Horas de Sueño': p.sleepHours || '',
      'Sinergia / Estrategia': p.notes || '',
      'Baya': p.berry
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  return XLSX.utils.sheet_to_csv(worksheet);
}
