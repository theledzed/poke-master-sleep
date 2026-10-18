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
  esPasado?: boolean;
  esHoy?: boolean;
  puntosEnPantalla?: number;
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
  vigorFinalSemana: number; // Promedio / Esperado
  vigorMinSemana: number;   // Mínimo estimado (sin críticos, peor suerte en skills)
  vigorMaxSemana: number;   // Techo optimista (con críticos '¡Riquísimo!', buen RNG)
  estadoRangoFinal: EstadoRango;
  estadoRangoMin: EstadoRango;
  estadoRangoMax: EstadoRango;
  timelineDias: ProyeccionDia[];
  hitosClave: HitoClave[];
  vigorDiaNormal: number;
  vigorDiaDomingo: number;
  isCalibrated: boolean;
  calibratedVigor?: number;
  calibratedDayIdx?: number;
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

  // 3. Estimar variación por día (Mínimo / Esperado / Máximo)
  // Lunes a Sábado:
  // - Base sin críticos de cocina (~90.9% de cocina esperada):
  const minDayNormal = Math.round(
    evalNormal.berryVigorDaily * 0.95 +
    evalNormal.cookingVigorDaily * 0.90 +
    evalNormal.skillVigorDaily * 0.80
  );
  const expectedDayNormal = vigorDiaNormal;
  const maxDayNormal = Math.round(
    evalNormal.berryVigorDaily * 1.05 +
    evalNormal.cookingVigorDaily * 1.35 +
    evalNormal.skillVigorDaily * 1.20
  );

  // Súper Domingo (30% de ¡Riquísimo! con 3x):
  // - Si no sale ningún crítico en domingo, la cocina da ~62.5% de su promedio dominical:
  const minDayDomingo = Math.round(
    evalDomingo.berryVigorDaily * 0.95 +
    evalDomingo.cookingVigorDaily * 0.65 +
    evalDomingo.skillVigorDaily * 0.80
  );
  const expectedDayDomingo = vigorDiaDomingo;
  const maxDayDomingo = Math.round(
    evalDomingo.berryVigorDaily * 1.05 +
    evalDomingo.cookingVigorDaily * 1.45 +
    evalDomingo.skillVigorDaily * 1.20
  );

  const isCalibrated = vigorInicial > 0;
  const timelineDias: ProyeccionDia[] = [];

  let vigorAcumulado = isCalibrated ? vigorInicial : 0;
  let remainingMinSum = 0;
  let remainingMaxSum = 0;

  // A) Si está calibrado a mitad de semana, rellenamos los días pasados (0 a diaInicioIdx - 1)
  if (isCalibrated && diaInicioIdx > 0) {
    for (let d = 0; d < diaInicioIdx; d++) {
      const frac = (d + 1) / diaInicioIdx;
      const vigorPast = Math.round(vigorInicial * frac);
      const estadoPast = calcularRangoSnorlax(islaId, vigorPast);
      const ganadoPast = d === 0 ? vigorPast : Math.round(vigorInicial / diaInicioIdx);

      timelineDias.push({
        diaNombre: DIAS_SEMANA[d],
        diaIdx: d,
        esDomingo: false,
        esPasado: true,
        vigorGanadoDia: ganadoPast,
        vigorAcumuladoFinDia: vigorPast,
        rangoAlcanzado: estadoPast.rangoActual,
        indiceRango: estadoPast.indiceRango,
        platosCocinados: []
      });
    }
  }

  // B) Días desde diaInicioIdx hasta el Domingo (índice 6)
  for (let d = isCalibrated ? diaInicioIdx : 0; d < 7; d++) {
    const esDom = d === 6;
    const isCurrentCalibratedDay = isCalibrated && d === diaInicioIdx;

    const normalDailyExpected = esDom ? expectedDayDomingo : expectedDayNormal;
    const normalDailyMin = esDom ? minDayDomingo : minDayNormal;
    const normalDailyMax = esDom ? maxDayDomingo : maxDayNormal;

    // Si es el día que el usuario calibró en vivo, solo se suma el restante de hoy (cena + noche ~35%)
    const vigorGanadoEsperado = isCurrentCalibratedDay
      ? Math.round(normalDailyExpected * 0.35)
      : normalDailyExpected;

    const vigorGanadoMin = isCurrentCalibratedDay
      ? Math.round(normalDailyMin * 0.35)
      : normalDailyMin;

    const vigorGanadoMax = isCurrentCalibratedDay
      ? Math.round(normalDailyMax * 0.35)
      : normalDailyMax;

    remainingMinSum += vigorGanadoMin;
    remainingMaxSum += vigorGanadoMax;
    vigorAcumulado += vigorGanadoEsperado;

    const estadoDia = calcularRangoSnorlax(islaId, vigorAcumulado);
    const platos = (esDom ? evalDomingo : evalNormal).meals
      .filter(m => m.recipe.baseVigor > 0)
      .map(m => m.recipe.name);

    timelineDias.push({
      diaNombre: DIAS_SEMANA[d],
      diaIdx: d,
      esDomingo: esDom,
      esPasado: false,
      esHoy: isCurrentCalibratedDay,
      puntosEnPantalla: isCurrentCalibratedDay ? vigorInicial : undefined,
      vigorGanadoDia: Math.round(vigorGanadoEsperado),
      vigorAcumuladoFinDia: Math.round(vigorAcumulado),
      rangoAlcanzado: estadoDia.rangoActual,
      indiceRango: estadoDia.indiceRango,
      platosCocinados: Array.from(new Set(platos))
    });
  }

  // 4. Totales y rangos finales por intervalo de confianza
  const vigorFinalSemana = Math.round(vigorAcumulado);
  const vigorMinSemana = Math.round((isCalibrated ? vigorInicial : 0) + remainingMinSum);
  const vigorMaxSemana = Math.round((isCalibrated ? vigorInicial : 0) + remainingMaxSum);

  const estadoRangoFinal = calcularRangoSnorlax(islaId, vigorFinalSemana);
  const estadoRangoMin = calcularRangoSnorlax(islaId, vigorMinSemana);
  const estadoRangoMax = calcularRangoSnorlax(islaId, vigorMaxSemana);

  // 5. Evaluar Hitos Clave de la Isla:
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
    const diaLogrado = timelineDias.find(d => !d.esPasado && d.vigorAcumuladoFinDia >= metaVigor)
      || timelineDias.find(d => d.vigorAcumuladoFinDia >= metaVigor);

    return {
      rango: nombreHito,
      indiceRango: h.idx,
      descripcion: h.desc,
      metaVigor,
      alcanzable: vigorFinalSemana >= metaVigor,
      diaAlcanzado: diaLogrado ? diaLogrado.diaNombre : undefined,
      vigorFaltante: vigorFinalSemana >= metaVigor ? 0 : Math.round(metaVigor - vigorFinalSemana)
    };
  });

  return {
    vigorFinalSemana,
    vigorMinSemana,
    vigorMaxSemana,
    estadoRangoFinal,
    estadoRangoMin,
    estadoRangoMax,
    timelineDias,
    hitosClave,
    vigorDiaNormal,
    vigorDiaDomingo,
    isCalibrated,
    calibratedVigor: isCalibrated ? vigorInicial : undefined,
    calibratedDayIdx: isCalibrated ? diaInicioIdx : undefined
  };
}
