import { Pokemon, SnorlaxConfig } from '../types/pokemon';
import { evaluateTeam } from './optimizer';
import {
  IslaId,
  normalizeIslaId,
  calcularRangoSnorlax,
  EstadoRango,
  NombreRango,
  NOMBRES_RANGOS,
  UMBRALES_ISLAS
} from '../data/islandRanks';

export interface ProyeccionDia {
  diaNombre: string;
  diaIdx: number;
  esDomingo: boolean;
  vigorGanadoDia: number;
  vigorAcumuladoFinDia: number;
  rangoAlcanzado: NombreRango;
  indiceRango: number;
  platosCocinados: string[];
}

export interface HitoClave {
  rango: NombreRango;
  indiceRango: number;
  descripcion: string;
  metaVigor: number;
  alcanzable: boolean;
  diaAlcanzado?: string;
  vigorFaltante?: number;
}

export interface ProyeccionSemanalCompleta {
  vigorFinalSemana: number;
  estadoRangoFinal: EstadoRango;
  timelineDias: ProyeccionDia[];
  hitosClave: HitoClave[];
  vigorDiaNormal: number;
  vigorDiaDomingo: number;
}

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function proyectarSemanaEquipo(
  equipo: Pokemon[],
  configBase: SnorlaxConfig,
  vigorInicial: number = 0,
  diaInicioIdx: number = 0
): ProyeccionSemanalCompleta {
  const islaId = normalizeIslaId(configBase.island);

  // 1. Evaluar día normal (Lunes a Sábado)
  const configNormal: SnorlaxConfig = { ...configBase, isSunday: false };
  const evalNormal = evaluateTeam(equipo, configNormal);
  const vigorDiaNormal = evalNormal.totalDailyVigor;

  // 2. Evaluar Domingo (Puchero Doble y Riquísimo 1.60x)
  const configDomingo: SnorlaxConfig = { ...configBase, isSunday: true };
  const evalDomingo = evaluateTeam(equipo, configDomingo);
  const vigorDiaDomingo = evalDomingo.totalDailyVigor;

  // 3. Proyectar línea temporal de Lunes a Domingo
  let vigorAcumulado = vigorInicial;
  const timelineDias: ProyeccionDia[] = [];

  for (let d = diaInicioIdx; d < 7; d++) {
    const esDom = d === 6;
    // If user enters their mid-week vigor on the current day, only the remaining portion of today (dinner + night ~35%) is added
    const isCurrentDayInput = vigorInicial > 0 && d === diaInicioIdx;
    const vigorGanado = isCurrentDayInput
      ? Math.round((esDom ? vigorDiaDomingo : vigorDiaNormal) * 0.35)
      : (esDom ? vigorDiaDomingo : vigorDiaNormal);

    vigorAcumulado += vigorGanado;

    const estadoDia = calcularRangoSnorlax(islaId, vigorAcumulado);
    const platos = (esDom ? evalDomingo : evalNormal).meals
      .filter(m => m.recipe.baseVigor > 0)
      .map(m => m.recipe.name);

    timelineDias.push({
      diaNombre: DIAS_SEMANA[d],
      diaIdx: d,
      esDomingo: esDom,
      vigorGanadoDia: Math.round(vigorGanado),
      vigorAcumuladoFinDia: Math.round(vigorAcumulado),
      rangoAlcanzado: estadoDia.rangoActual,
      indiceRango: estadoDia.indiceRango,
      platosCocinados: Array.from(new Set(platos))
    });
  }

  const estadoRangoFinal = calcularRangoSnorlax(islaId, vigorAcumulado);

  // 4. Evaluar Hitos Clave de la Isla:
  // - Súper 1 (idx 5)
  // - Ultra 1 (idx 10)
  // - Máster 1 (idx 15)
  // - Máster 3 (idx 17) -> Incienso Pokémon Semanal
  // - Máster 10 (idx 24)
  // - Máster 20 (idx 34)
  const hitosDef = [
    { idx: 5, desc: 'Rango Súper' },
    { idx: 10, desc: 'Rango Ultra' },
    { idx: 15, desc: 'Rango Máster' },
    { idx: 17, desc: 'Incienso Semanal' },
    { idx: 24, desc: 'Máster Alto' },
    { idx: 34, desc: 'Rango Máximo' }
  ];

  const umbrales = UMBRALES_ISLAS[islaId] || UMBRALES_ISLAS.verdegal;

  const hitosClave: HitoClave[] = hitosDef.map(h => {
    const nombreHito = NOMBRES_RANGOS[h.idx];
    const metaVigor = umbrales[h.idx];
    const diaLogrado = timelineDias.find(d => d.vigorAcumuladoFinDia >= metaVigor);

    return {
      rango: nombreHito,
      indiceRango: h.idx,
      descripcion: h.desc,
      metaVigor,
      alcanzable: vigorAcumulado >= metaVigor,
      diaAlcanzado: diaLogrado ? diaLogrado.diaNombre : undefined,
      vigorFaltante: vigorAcumulado >= metaVigor ? 0 : Math.round(metaVigor - vigorAcumulado)
    };
  });

  return {
    vigorFinalSemana: Math.round(vigorAcumulado),
    estadoRangoFinal,
    timelineDias,
    hitosClave,
    vigorDiaNormal,
    vigorDiaDomingo
  };
}
