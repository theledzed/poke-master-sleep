export type IslaId =
  | 'verdegal'
  | 'verdegal_experto'
  | 'turquesa'
  | 'pardagris'
  | 'galanto'
  | 'lazulita'
  | 'central_dorada'
  | 'desfiladero_ambar';

export const NOMBRES_RANGOS = [
  'Común 1', 'Común 2', 'Común 3', 'Común 4', 'Común 5',
  'Súper 1', 'Súper 2', 'Súper 3', 'Súper 4', 'Súper 5',
  'Ultra 1', 'Ultra 2', 'Ultra 3', 'Ultra 4', 'Ultra 5',
  'Máster 1', 'Máster 2', 'Máster 3', 'Máster 4', 'Máster 5',
  'Máster 6', 'Máster 7', 'Máster 8', 'Máster 9', 'Máster 10',
  'Máster 11', 'Máster 12', 'Máster 13', 'Máster 14', 'Máster 15',
  'Máster 16', 'Máster 17', 'Máster 18', 'Máster 19', 'Máster 20'
] as const;

export type NombreRango = typeof NOMBRES_RANGOS[number];

export const UMBRALES_ISLAS: Record<IslaId, readonly number[]> = {
  verdegal: [
    0, 3118, 7171, 11693, 17149,
    23385, 31492, 41314, 53006, 65634,
    79197, 93540, 109130, 125032, 156121,
    187832, 220177, 253169, 286821, 321146,
    356158, 391870, 428296, 465451, 532707,
    601308, 742056, 885619, 1029700, 1199506,
    1486800, 1795052, 2165541, 2604280, 3245795
  ],
  verdegal_experto: [
    0, 41895, 96358, 157104, 228205,
    309675, 414995, 539088, 684812, 839478,
    997610, 1178280, 1374658, 1580857, 1797364,
    2014314, 2251791, 2501141, 2760321, 3057187,
    3361630, 3667816, 4014149, 4378519, 4778794,
    5184989, 5614239, 6067795, 6541407, 7152862,
    7780648, 8414117, 9067058, 9752517, 10981171
  ],
  turquesa: [
    0, 4822, 11090, 18082, 26520,
    36164, 48700, 63889, 81971, 101499,
    122474, 144654, 168763, 195283, 224455,
    256544, 291842, 330670, 373381, 420363,
    472043, 528891, 591424, 660210, 735875,
    819107, 910662, 1018462, 1184155, 1379432,
    1709820, 2064310, 2490372, 2994922, 3732664
  ],
  pardagris: [
    0, 6885, 15835, 25817, 37865,
    51635, 69534, 91221, 117038, 144921,
    174869, 206538, 240961, 278826, 320478,
    366295, 416694, 472133, 533116, 600197,
    673986, 755154, 844439, 942653, 1050688,
    1169527, 1300250, 1444045, 1602220, 1776213,
    1967605, 2333568, 2815203, 3385564, 4219534
  ],
  galanto: [
    0, 10486, 24118, 39323, 57673,
    78645, 105909, 138940, 178262, 220730,
    266344, 314580, 367010, 424683, 488123,
    557907, 634669, 719107, 811989, 914159,
    1026546, 1150172, 1286161, 1435749, 1600296,
    1781298, 1980400, 2199412, 2440325, 2705329,
    2996833, 3317487, 3670206, 4058197, 4706403
  ],
  lazulita: [
    0, 12938, 29756, 48515, 71156,
    97031, 130668, 171420, 219936, 272333,
    328610, 388122, 452809, 522025, 596086,
    675330, 760123, 850851, 958702, 1075709,
    1202596, 1340143, 1489190, 1650645, 1825483,
    2014758, 2219603, 2441243, 2680993, 2925574,
    3188730, 3454577, 3739033, 4166848, 5193272
  ],
  central_dorada: [
    0, 20142, 46326, 75531, 110779,
    151061, 203429, 266875, 342406, 423979,
    511595, 604246, 704953, 810696, 921725,
    1038306, 1160717, 1289248, 1431702, 1582395,
    1741777, 1910321, 2088527, 2276921, 2476059,
    2686523, 2908932, 3143935, 3442846, 3744954,
    4086475, 4451914, 4909073, 5472793, 6674166
  ],
  desfiladero_ambar: [
    0, 26478, 60899, 99293, 145629,
    198585, 264456, 344986, 440123, 541880,
    654607, 774923, 900988, 1033561, 1176798,
    1325740, 1485571, 1650692, 1828870, 2015408,
    2215366, 2427642, 2655957, 2904897, 3179971,
    3470704, 3774089, 4097770, 4430839, 4815792,
    5236414, 5715237, 6304719, 7019168, 8528976
  ]
};

export interface EstadoRango {
  indiceRango: number;          // 0 (Común 1) a 34 (Máster 20)
  rangoActual: NombreRango;
  vigorActual: number;
  vigorBaseRangoActual: number;
  siguienteRango: NombreRango | null;
  vigorFaltanteSiguiente: number;
  porcentajeProgresoSiguiente: number; // 0 a 100
}

// Map common internal IDs to IslaId
export function normalizeIslaId(raw: string): IslaId {
  const clean = (raw || '').toLowerCase().trim();
  if (clean.includes('experto')) return 'verdegal_experto';
  if (clean === 'greengrass' || clean.includes('verdegal')) return 'verdegal';
  if (clean === 'cyan' || clean.includes('turquesa')) return 'turquesa';
  if (clean === 'taupe' || clean.includes('pard') || clean.includes('cueva')) return 'pardagris';
  if (clean === 'snowdrop' || clean.includes('nieven') || clean.includes('galanto') || clean.includes('tundra')) return 'galanto';
  if (clean === 'lapis' || clean.includes('lazulita') || clean.includes('lago')) return 'lazulita';
  if (clean === 'powerplant' || clean.includes('central') || clean.includes('dorada')) return 'central_dorada';
  if (clean.includes('ambar') || clean.includes('desfiladero')) return 'desfiladero_ambar';
  return 'verdegal';
}

/**
 * Búsqueda binaria O(log 35) para obtener el rango exacto dado cualquier Vigor.
 */
export function calcularRangoSnorlax(islaRaw: string, vigorAcumulado: number): EstadoRango {
  const islaId = normalizeIslaId(islaRaw);
  const umbrales = UMBRALES_ISLAS[islaId] || UMBRALES_ISLAS.verdegal;
  let low = 0;
  let high = umbrales.length - 1;
  let idx = 0;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (umbrales[mid] <= vigorAcumulado) {
      idx = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  const esMaximo = idx === umbrales.length - 1;
  const baseActual = umbrales[idx];
  const metaSiguiente = esMaximo ? baseActual : umbrales[idx + 1];
  const faltante = esMaximo ? 0 : Math.max(0, metaSiguiente - vigorAcumulado);
  const rangoSize = metaSiguiente - baseActual;
  const progreso = esMaximo
    ? 100
    : rangoSize > 0
    ? Math.min(100, Math.round(((vigorAcumulado - baseActual) / rangoSize) * 100))
    : 100;

  return {
    indiceRango: idx,
    rangoActual: NOMBRES_RANGOS[idx],
    vigorActual: Math.round(vigorAcumulado),
    vigorBaseRangoActual: baseActual,
    siguienteRango: esMaximo ? null : NOMBRES_RANGOS[idx + 1],
    vigorFaltanteSiguiente: Math.round(faltante),
    porcentajeProgresoSiguiente: progreso
  };
}
