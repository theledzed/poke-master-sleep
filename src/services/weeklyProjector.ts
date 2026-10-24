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
  vigorEsperadoAHora?: number; // Vigor estimado a la hora actual del día en curso
  vigorGanadoDia: number;
  vigorAcumuladoFinDia: number; // Cierre oficial a las 04:00 AM
  vigorGanado10AM?: number;     // Vigor ganado hasta las 10:00 AM (1 desayuno + 6h de vigilia)
  vigorGanado10PM?: number;     // Vigor ganado hasta las 10:00 PM (3 comidas + 18h de vigilia)
  metaAcumulada10AM?: number;   // Acumulado hasta las 10:00 AM (desayuno + noche procesada)
  metaAcumulada10PM?: number;   // Acumulado hasta las 10:00 PM (ideal para antes de dormir)
  cierreHoraLabel?: string;     // Siempre '04:00 AM'
  rangoAlcanzado: NombreRango;
  rangoAlcanzado10AM?: NombreRango;
  rangoAlcanzado10PM?: NombreRango;
  indiceRango: number;
  platosCocinados: string[];
  horasRestantesHoy?: number;
  faltaDesayuno?: boolean;
  faltaCena?: boolean;
  vigorDesayunoPendiente?: number;
  vigorCenaPendiente?: number;
  vigorNochePendiente?: number;
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
  vigorFinalSemana: number; // Promedio / Techo de laboratorio al cierre de la semana (Dom 04:00 AM)
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
  calibratedUpdatedAt?: string;
  calibratedBreakfastEaten?: boolean;
  calibratedLunchEaten?: boolean;
  calibratedDinnerEaten?: boolean;
  // Métricas del ritmo en tiempo real del día en curso:
  currentSleepDayIdx: number;
  currentDayElapsedHours: number;
  currentDayRemainingHours: number;
  currentDayIntradayExpectedVigor: number; // Puntos esperados a este minuto exacto
  currentDayBreakfastPending: boolean;
  currentDayDinnerPending: boolean;
  currentDayExpected10AM: number;          // Meta de hoy a las 10:00 AM (al despertar + desayuno)
  currentDayExpected10PM: number;          // Meta de hoy a las 10:00 PM (antes de dormir)
  // Métricas adaptativas (Realidad vs. Papel):
  eficienciaCampamento: number;            // Porcentaje de eficiencia real (ej: 86 para 86%, 101 para 101%)
  promedioDiarioReal: number;              // Puntos reales promedio por día
  promedioDiarioTeorico: number;           // Puntos teóricos esperados por día
  vigorProyectadoAdaptado: number;         // Vigor proyectado al domingo según el ritmo real empírico
  estadoRangoAdaptado: EstadoRango;        // Rango al que apunta según su rendimiento real
  vigorTeoricoSinCalibrar: number;         // Techo teórico ideal (100% óptimo de laboratorio)
  estadoRangoTeorico: EstadoRango;         // Rango teórico ideal
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/**
 * En Pokémon Sleep, el día canónico va de 04:00 AM a 04:00 AM del día siguiente.
 * Si son entre las 00:00 y las 03:59, aún cuenta como el día de ayer.
 * Retorna: 0=Lunes, 1=Martes, 2=Miércoles, 3=Jueves, 4=Viernes, 5=Sábado, 6=Domingo.
 */
export function getPokemonSleepDayIndex(date: Date = new Date()): number {
  const adjusted = new Date(date);
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  const jsDay = adjusted.getDay(); // 0=Dom, 1=Lun ... 6=Sab
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Retorna las horas transcurridas en la jornada oficial de Pokémon Sleep (de 0 a 24 horas),
 * tomando como punto de inicio las 04:00 AM locales.
 */
export function getSleepDayHoursElapsed(date: Date = new Date()): number {
  const h = date.getHours();
  const m = date.getMinutes();
  const timeInHours = h + m / 60;
  return timeInHours >= 4 ? timeInHours - 4 : timeInHours + 20;
}

/**
 * Ventana horaria oficial de cocina en Pokémon Sleep:
 * - Desayuno: 06:00 a 12:00
 * - Almuerzo: 12:00 a 18:00
 * - Cena: 18:00 a 06:00
 */
export function getSleepMealWindow(date: Date = new Date()): {
  meal: 'desayuno' | 'almuerzo' | 'cena';
  label: string;
  isDinnerTime: boolean;
} {
  const h = date.getHours();
  if (h >= 6 && h < 12) {
    return { meal: 'desayuno', label: 'Desayuno (06:00 - 12:00)', isDinnerTime: false };
  }
  if (h >= 12 && h < 18) {
    return { meal: 'almuerzo', label: 'Almuerzo (12:00 - 18:00)', isDinnerTime: false };
  }
  return { meal: 'cena', label: 'Cena (18:00 - 06:00)', isDinnerTime: true };
}

export function proyectarSemanaEquipo(
  equipo: Pokemon[],
  configBase: SnorlaxConfig,
  vigorInicial: number = 0,
  diaInicioIdx: number = 0,
  updatedAtStr?: string,
  dinnerEaten?: boolean,
  breakfastEaten?: boolean,
  lunchEaten?: boolean
): ProyeccionSemanalCompleta {
  const islaId = normalizeIslaId(configBase.island);

  // 1. Evaluar día normal (Lunes a Sábado)
  const configNormal: SnorlaxConfig = { ...configBase, isSunday: false };
  const evalNormal = evaluateTeam(equipo, configNormal);
  const vigorDiaNormal = evalNormal.totalDailyVigor;
  const singleMealNormal = Math.round(evalNormal.cookingVigorDaily / 3);
  const teamDailyNormal = evalNormal.berryVigorDaily + evalNormal.skillVigorDaily;

  // 2. Evaluar Domingo (Puchero Doble y Riquísimo 1.60x)
  const configDomingo: SnorlaxConfig = { ...configBase, isSunday: true };
  const evalDomingo = evaluateTeam(equipo, configDomingo);
  const vigorDiaDomingo = evalDomingo.totalDailyVigor;
  const singleMealDomingo = Math.round(evalDomingo.cookingVigorDaily / 3);
  const teamDailyDomingo = evalDomingo.berryVigorDaily + evalDomingo.skillVigorDaily;

  // 3. Estimar variación por día (Mínimo / Esperado / Máximo)
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

  // Detección del tiempo real de Pokémon Sleep hoy
  const now = new Date();
  const currentSleepDayIdx = getPokemonSleepDayIndex(now);
  const currentDayElapsedHours = getSleepDayHoursElapsed(now);
  const currentDayRemainingHours = Math.max(0, 24 - currentDayElapsedHours);

  const effectiveUpdatedAt = updatedAtStr || configBase.midWeekProgress?.updatedAt;
  const effectiveBreakfastEaten = breakfastEaten !== undefined
    ? breakfastEaten
    : configBase.midWeekProgress?.breakfastEaten;
  const effectiveLunchEaten = lunchEaten !== undefined
    ? lunchEaten
    : configBase.midWeekProgress?.lunchEaten;
  const effectiveDinnerEaten = dinnerEaten !== undefined
    ? dinnerEaten
    : configBase.midWeekProgress?.dinnerEaten;

  // Comidas consumidas hoy a esta hora (tomando en cuenta estado de calibración si aplica)
  const currentHour = now.getHours();
  let mealsElapsedSoFar = 0;
  if (currentHour >= 4 && currentHour < 6) {
    mealsElapsedSoFar = 0;
  } else if (currentHour >= 6 && currentHour < 12) {
    if (effectiveBreakfastEaten !== undefined) {
      mealsElapsedSoFar = effectiveBreakfastEaten ? 1 : 0;
    } else {
      mealsElapsedSoFar = currentHour >= 9 ? 1 : 0;
    }
  } else if (currentHour >= 12 && currentHour < 18) {
    if (effectiveLunchEaten !== undefined) {
      mealsElapsedSoFar = 1 + (effectiveLunchEaten ? 1 : 0);
    } else {
      mealsElapsedSoFar = currentHour >= 14 ? 2 : 1;
    }
  } else {
    // 18:00 - 04:00 (Ventana de cena)
    if (effectiveDinnerEaten !== undefined) {
      mealsElapsedSoFar = 2 + (effectiveDinnerEaten ? 1 : 0);
    } else {
      mealsElapsedSoFar = 2; // Cena pendiente por defecto
    }
  }

  const isTodaySunday = currentSleepDayIdx === 6;
  const currentSingleMeal = isTodaySunday ? singleMealDomingo : singleMealNormal;
  const currentTeamDaily = isTodaySunday ? teamDailyDomingo : teamDailyNormal;

  // Vigor intradía que tu Snorlax debería llevar exactamente en este momento:
  const currentDayIntradayExpectedVigor = Math.round(
    (currentSleepDayIdx * vigorDiaNormal) +
    (currentTeamDaily * (currentDayElapsedHours / 24)) +
    (mealsElapsedSoFar * currentSingleMeal)
  );

  // Checkpoints humanos del día de hoy:
  const currentDayPrevAcum = currentSleepDayIdx * vigorDiaNormal;
  const currentDayExpected10AM = Math.round(
    currentDayPrevAcum + (1 * currentSingleMeal) + (currentTeamDaily * 0.25)
  );
  const currentDayExpected10PM = Math.round(
    currentDayPrevAcum + (3 * currentSingleMeal) + (currentTeamDaily * 0.75)
  );

  const currentDayBreakfastPending = (currentHour >= 6 && currentHour < 12) && effectiveBreakfastEaten !== true;
  const currentDayDinnerPending = (currentHour >= 18 || currentHour < 4) && effectiveDinnerEaten !== true;

  const isCalibrated = vigorInicial > 0;
  const timelineDias: ProyeccionDia[] = [];

  // Factor de Eficiencia Empírica (Realidad vs. Papel)
  const etaRaw = isCalibrated && currentDayIntradayExpectedVigor > 0
    ? (vigorInicial / currentDayIntradayExpectedVigor)
    : 1.0;
  const etaClamped = Math.max(0.50, Math.min(1.40, etaRaw));
  const eficienciaCampamento = Math.round(etaClamped * 100);

  const daysElapsedFloat = Math.max(0.25, (isCalibrated ? diaInicioIdx : currentSleepDayIdx) + (currentDayElapsedHours / 24));
  const promedioDiarioReal = isCalibrated
    ? Math.round(vigorInicial / daysElapsedFloat)
    : Math.round(vigorDiaNormal);
  const promedioDiarioTeorico = Math.round(vigorDiaNormal);

  let vigorAcumulado = isCalibrated ? vigorInicial : 0;
  let remainingMinSum = 0;
  let remainingMaxSum = 0;
  let remainingAdaptedSum = 0;

  // A) Si está calibrado a mitad de semana, rellenamos los días pasados (0 a diaInicioIdx - 1)
  if (isCalibrated && diaInicioIdx > 0) {
    for (let d = 0; d < diaInicioIdx; d++) {
      const frac = (d + 1) / diaInicioIdx;
      const vigorPast = Math.round(vigorInicial * frac);
      const estadoPast = calcularRangoSnorlax(islaId, vigorPast);
      const ganadoPast = d === 0 ? vigorPast : Math.round(vigorInicial / diaInicioIdx);
      const pastPrevAcum = d === 0 ? 0 : Math.round(vigorInicial * (d / diaInicioIdx));
      const pastSingleMeal = singleMealNormal;
      const pastTeamDaily = teamDailyNormal;
      const past10AM = Math.round((1 * pastSingleMeal) + (pastTeamDaily * 0.25));
      const past10PM = Math.round((3 * pastSingleMeal) + (pastTeamDaily * 0.75));
      const pastMeta10AM = pastPrevAcum + past10AM;
      const pastMeta10PM = pastPrevAcum + past10PM;
      const estado10AM = calcularRangoSnorlax(islaId, pastMeta10AM);
      const estado10PM = calcularRangoSnorlax(islaId, pastMeta10PM);

      timelineDias.push({
        diaNombre: DIAS_SEMANA[d],
        diaIdx: d,
        esDomingo: false,
        esPasado: true,
        cierreHoraLabel: '04:00 AM',
        vigorGanadoDia: ganadoPast,
        vigorAcumuladoFinDia: vigorPast,
        vigorGanado10AM: past10AM,
        vigorGanado10PM: past10PM,
        metaAcumulada10AM: pastMeta10AM,
        metaAcumulada10PM: pastMeta10PM,
        rangoAlcanzado: estadoPast.rangoActual,
        rangoAlcanzado10AM: estado10AM.rangoActual,
        rangoAlcanzado10PM: estado10PM.rangoActual,
        indiceRango: estadoPast.indiceRango,
        platosCocinados: []
      });
    }
  }

  // B) Días desde diaInicioIdx (o 0 si teórico) hasta el Domingo (índice 6)
  for (let d = isCalibrated ? diaInicioIdx : 0; d < 7; d++) {
    const esDom = d === 6;
    const isCurrentCalibratedDay = isCalibrated && d === diaInicioIdx;
    const isToday = d === currentSleepDayIdx;

    const normalDailyExpected = esDom ? expectedDayDomingo : expectedDayNormal;
    const normalDailyMin = esDom ? minDayDomingo : minDayNormal;
    const normalDailyMax = esDom ? maxDayDomingo : maxDayNormal;

    const dayEval = esDom ? evalDomingo : evalNormal;
    const dayTeamDaily = esDom ? teamDailyDomingo : teamDailyNormal;
    const daySingleMeal = esDom ? singleMealDomingo : singleMealNormal;

    let vigorGanadoEsperado = normalDailyExpected;
    let vigorGanadoMin = normalDailyMin;
    let vigorGanadoMax = normalDailyMax;
    let pendingDinnerVigor = 0;
    let pendingBreakfastVigor = 0;
    let pendingNightVigor = 0;
    let faltaCena = false;
    let faltaDesayuno = false;

    if (isCurrentCalibratedDay) {
      // Usar la fecha exacta de calibración para calcular el tiempo restante con precisión
      const calibDate = effectiveUpdatedAt ? new Date(effectiveUpdatedAt) : now;
      const calibElapsedHours = getSleepDayHoursElapsed(calibDate);
      const calibRemainingHours = Math.max(0, 24 - calibElapsedHours);
      const remainingTeamFraction = calibRemainingHours / 24;

      pendingNightVigor = Math.round(dayTeamDaily * remainingTeamFraction);

      // Determinar si faltan comidas según la hora de calibración y la respuesta del usuario
      const calibHour = calibDate.getHours();
      let pendingMeals = 0;

      if (calibHour >= 4 && calibHour < 6) {
        pendingMeals = 3;
        faltaDesayuno = true;
        faltaCena = true;
      } else if (calibHour >= 6 && calibHour < 12) {
        if (effectiveBreakfastEaten === true) {
          pendingMeals = 2; // Faltan almuerzo y cena
          faltaDesayuno = false;
        } else {
          pendingMeals = 3; // Faltan desayuno, almuerzo y cena
          faltaDesayuno = true;
        }
        faltaCena = true;
      } else if (calibHour >= 12 && calibHour < 18) {
        if (effectiveLunchEaten === true) {
          pendingMeals = 1; // Solo falta la cena
        } else {
          pendingMeals = 2; // Faltan almuerzo y cena
        }
        faltaCena = true;
      } else {
        // 18:00 - 04:00 (Ventana de cena)
        if (effectiveDinnerEaten === true) {
          pendingMeals = 0;
          faltaCena = false;
        } else {
          pendingMeals = 1;
          faltaCena = true;
        }
      }

      const pendingMealsVigor = pendingMeals * daySingleMeal;
      pendingDinnerVigor = faltaCena ? daySingleMeal : 0;
      pendingBreakfastVigor = faltaDesayuno ? daySingleMeal : 0;

      // Para el día actual calibrado, aplicamos eficiencia al tiempo restante de recolección
      const adaptedPendingNight = Math.round(pendingNightVigor * etaClamped);
      vigorGanadoEsperado = adaptedPendingNight + pendingMealsVigor;
      vigorGanadoMin = Math.round(
        (dayEval.berryVigorDaily * 0.95 + dayEval.skillVigorDaily * 0.80) * remainingTeamFraction * etaClamped +
        (pendingMealsVigor * 0.90)
      );
      vigorGanadoMax = Math.round(
        (dayEval.berryVigorDaily * 1.05 + dayEval.skillVigorDaily * 1.20) * remainingTeamFraction * etaClamped +
        (pendingMealsVigor * 1.35)
      );

      remainingAdaptedSum += adaptedPendingNight + pendingMealsVigor;
    } else if (isCalibrated && d > diaInicioIdx) {
      // Días futuros adaptados al rendimiento real del campamento (etaClamped)
      vigorGanadoEsperado = Math.round(normalDailyExpected * etaClamped);
      vigorGanadoMin = Math.round(normalDailyMin * etaClamped);
      vigorGanadoMax = Math.round(normalDailyMax * etaClamped);
      remainingAdaptedSum += vigorGanadoEsperado;
    }

    remainingMinSum += vigorGanadoMin;
    remainingMaxSum += vigorGanadoMax;
    vigorAcumulado += vigorGanadoEsperado;

    const estadoDia = calcularRangoSnorlax(islaId, vigorAcumulado);
    const platos = dayEval.meals
      .filter(m => m.recipe.baseVigor > 0)
      .map(m => m.recipe.name);

    const prevDayAcum = timelineDias.length > 0
      ? timelineDias[timelineDias.length - 1].vigorAcumuladoFinDia
      : (d > 0 ? (d * vigorDiaNormal) : 0);

    const adaptedDayScale = (isCalibrated && d > diaInicioIdx) ? etaClamped : 1.0;
    const day10AM = Math.round(((1 * daySingleMeal) + (dayTeamDaily * 0.25)) * adaptedDayScale);
    const day10PM = Math.round(((3 * daySingleMeal) + (dayTeamDaily * 0.75)) * adaptedDayScale);
    const metaAcum10AM = prevDayAcum + day10AM;
    const metaAcum10PM = prevDayAcum + day10PM;
    const estado10AM = calcularRangoSnorlax(islaId, metaAcum10AM);
    const estado10PM = calcularRangoSnorlax(islaId, metaAcum10PM);

    timelineDias.push({
      diaNombre: DIAS_SEMANA[d],
      diaIdx: d,
      esDomingo: esDom,
      esPasado: false,
      esHoy: isToday,
      cierreHoraLabel: '04:00 AM',
      puntosEnPantalla: isCurrentCalibratedDay ? vigorInicial : undefined,
      vigorEsperadoAHora: isToday ? currentDayIntradayExpectedVigor : undefined,
      vigorGanadoDia: Math.round(vigorGanadoEsperado),
      vigorAcumuladoFinDia: Math.round(vigorAcumulado),
      vigorGanado10AM: day10AM,
      vigorGanado10PM: day10PM,
      metaAcumulada10AM: metaAcum10AM,
      metaAcumulada10PM: metaAcum10PM,
      rangoAlcanzado: estadoDia.rangoActual,
      rangoAlcanzado10AM: estado10AM.rangoActual,
      rangoAlcanzado10PM: estado10PM.rangoActual,
      indiceRango: estadoDia.indiceRango,
      platosCocinados: Array.from(new Set(platos)),
      horasRestantesHoy: isCurrentCalibratedDay ? Math.round(24 - getSleepDayHoursElapsed(effectiveUpdatedAt ? new Date(effectiveUpdatedAt) : now)) : undefined,
      faltaDesayuno: isCurrentCalibratedDay ? faltaDesayuno : undefined,
      faltaCena: isCurrentCalibratedDay ? faltaCena : undefined,
      vigorDesayunoPendiente: isCurrentCalibratedDay && pendingBreakfastVigor > 0 ? pendingBreakfastVigor : undefined,
      vigorCenaPendiente: isCurrentCalibratedDay && pendingDinnerVigor > 0 ? pendingDinnerVigor : undefined,
      vigorNochePendiente: isCurrentCalibratedDay ? pendingNightVigor : undefined
    });
  }

  // 4. Totales y rangos finales por intervalo de confianza
  const vigorFinalSemana = Math.round(vigorAcumulado);
  const vigorMinSemana = Math.round((isCalibrated ? vigorInicial : 0) + remainingMinSum);
  const vigorMaxSemana = Math.round((isCalibrated ? vigorInicial : 0) + remainingMaxSum);

  const estadoRangoFinal = calcularRangoSnorlax(islaId, vigorFinalSemana);
  const estadoRangoMin = calcularRangoSnorlax(islaId, vigorMinSemana);
  const estadoRangoMax = calcularRangoSnorlax(islaId, vigorMaxSemana);

  // Proyección Adaptada según Ritmo Real
  const vigorProyectadoAdaptado = isCalibrated
    ? Math.round(vigorInicial + remainingAdaptedSum)
    : vigorFinalSemana;
  const estadoRangoAdaptado = calcularRangoSnorlax(islaId, vigorProyectadoAdaptado);

  // Techo Teórico Sin Calibrar (Papel / Laboratorio 100%)
  const vigorTeoricoSinCalibrar = Math.round((vigorDiaNormal * 6) + vigorDiaDomingo);
  const estadoRangoTeorico = calcularRangoSnorlax(islaId, vigorTeoricoSinCalibrar);

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
    calibratedDayIdx: isCalibrated ? diaInicioIdx : undefined,
    calibratedUpdatedAt: isCalibrated ? effectiveUpdatedAt : undefined,
    calibratedBreakfastEaten: isCalibrated ? effectiveBreakfastEaten : undefined,
    calibratedLunchEaten: isCalibrated ? effectiveLunchEaten : undefined,
    calibratedDinnerEaten: isCalibrated ? effectiveDinnerEaten : undefined,
    currentSleepDayIdx,
    currentDayElapsedHours,
    currentDayRemainingHours,
    currentDayIntradayExpectedVigor,
    currentDayBreakfastPending,
    currentDayDinnerPending,
    currentDayExpected10AM,
    currentDayExpected10PM,
    eficienciaCampamento,
    promedioDiarioReal,
    promedioDiarioTeorico,
    vigorProyectadoAdaptado,
    estadoRangoAdaptado,
    vigorTeoricoSinCalibrar,
    estadoRangoTeorico
  };
}
