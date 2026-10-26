import { DishType, Nature, Recipe, Subskill } from '../types/pokemon';

export interface IngredientMeta {
  name: string;
  vigor: number;
  aliases: string[];
}

export const INGREDIENTS: Record<string, IngredientMeta> = {
  'Puerro Grueso': { name: 'Puerro Grueso', vigor: 185, aliases: ['puerro grueso', 'puerro'] },
  'Seta Sabrosa': { name: 'Seta Sabrosa', vigor: 167, aliases: ['seta sabrosa', 'setas sabrosas', 'seta'] },
  'Huevo Selecto': { name: 'Huevo Selecto', vigor: 115, aliases: ['huevo selecto', 'huevo', 'huevos'] },
  'Patata': { name: 'Patata', vigor: 124, aliases: ['patata', 'patata suave', 'patatas'] },
  'Manzana Selecta': { name: 'Manzana Selecta', vigor: 90, aliases: ['manzana selecta', 'manzana', 'manzanas'] },
  'Hierba Picante': { name: 'Hierba Picante', vigor: 130, aliases: ['hierba picante', 'hierba', 'hierbas'] },
  'Fiambre Vegetariano': { name: 'Fiambre Vegetariano', vigor: 103, aliases: ['fiambre vegetariano', 'salchicha selecta', 'salchicha gruesa', 'salchicha'] },
  'Leche Mu-mu': { name: 'Leche Mu-mu', vigor: 98, aliases: ['leche mu-mu', 'leche', 'leche mumu'] },
  'Miel': { name: 'Miel', vigor: 104, aliases: ['miel', 'miel dulce'] },
  'Aceite Puro': { name: 'Aceite Puro', vigor: 121, aliases: ['aceite puro', 'aceite'] },
  'Jengibre': { name: 'Jengibre', vigor: 109, aliases: ['jengibre', 'jengibre picante'] },
  'Siestomate': { name: 'Siestomate', vigor: 110, aliases: ['siestomate', 'tomate', 'tomate ronco', 'tomate snooze', 'tomate jugoso', 'tomate demente'] },
  'Cacao Relajante': { name: 'Cacao Relajante', vigor: 151, aliases: ['cacao relajante', 'cacao'] },
  'Cola de Slowpoke': { name: 'Cola de Slowpoke', vigor: 342, aliases: ['cola de slowpoke', 'cola suave', 'cola'] },
  'Soja Verdegal': { name: 'Soja Verdegal', vigor: 100, aliases: ['soja verdegal', 'soja'] },
  'Maíz Verdegal': { name: 'Maíz Verdegal', vigor: 140, aliases: ['maíz verdegal', 'maiz verdegal', 'maíz', 'maiz'] },
  'Café Estimulante': { name: 'Café Estimulante', vigor: 153, aliases: ['café estimulante', 'cafe estimulante', 'café', 'cafe'] },
  'Calabaza Suculenta': { name: 'Calabaza Suculenta', vigor: 250, aliases: ['calabaza suculenta', 'calabaza'] },
  'Aguacate': { name: 'Aguacate', vigor: 162, aliases: ['aguacate'] }
};

export function normalizeIngredientName(raw: string): string {
  const clean = raw.trim().toLowerCase();
  for (const [canonical, meta] of Object.entries(INGREDIENTS)) {
    if (meta.aliases.some(alias => clean.includes(alias))) {
      return canonical;
    }
  }
  return raw.trim();
}

// Dish Level to % Bonus (Levels 1 to 65)
export const DISH_LEVEL_BONUS: Record<number, number> = {
  1: 0, 2: 2, 3: 4, 4: 6, 5: 8, 6: 9, 7: 11, 8: 13, 9: 16, 10: 18,
  11: 19, 12: 21, 13: 23, 14: 24, 15: 26, 16: 28, 17: 30, 18: 31, 19: 33, 20: 35,
  21: 37, 22: 40, 23: 42, 24: 45, 25: 47, 26: 50, 27: 52, 28: 55, 29: 58, 30: 61,
  31: 64, 32: 67, 33: 70, 34: 74, 35: 77, 36: 81, 37: 84, 38: 88, 39: 92, 40: 96,
  41: 100, 42: 104, 43: 108, 44: 113, 45: 117, 46: 122, 47: 127, 48: 132, 49: 137, 50: 142,
  51: 148, 52: 153, 53: 159, 54: 165, 55: 171, 56: 177, 57: 183, 58: 190, 59: 197, 60: 203,
  61: 209, 62: 215, 63: 221, 64: 227, 65: 234
};

// Pot Sizes
export const POT_SIZES = [15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81];

// Official Recipes
export const RECIPES: Recipe[] = [
  // --- GUISOS Y CURRIS ---
  {
    id: 'curry-1',
    name: 'Curri de Manzana Selecta',
    type: 'curry',
    baseVigor: 748,
    ingredients: { 'Manzana Selecta': 7 },
    description: 'Curri sencillo en el que destaca el dulzor natural de la manzana.'
  },
  {
    id: 'curry-2',
    name: 'Curri de Cola a la Parrilla',
    type: 'curry',
    baseVigor: 7483,
    ingredients: { 'Cola de Slowpoke': 8, 'Hierba Picante': 25 },
    description: 'El sabor de la cola eleva el plato a nuevas cotas de exquisitez.'
  },
  {
    id: 'curry-3',
    name: 'Curri de Tomate "Poder Solar"',
    type: 'curry',
    baseVigor: 2078,
    ingredients: { 'Siestomate': 10, 'Hierba Picante': 5 },
    description: 'En su elaboración se emplean tomates madurados al sol.'
  },
  {
    id: 'curry-4',
    name: 'Curri Cremoso "Comesueños"',
    type: 'curry',
    baseVigor: 9010,
    ingredients: { 'Patata': 18, 'Siestomate': 15, 'Cacao Relajante': 12, 'Leche Mu-mu': 10 },
    description: 'Curri elaborado con ingredientes de propiedades relajantes.'
  },
  {
    id: 'curry-5',
    name: 'Curri de Puerro Picante',
    type: 'curry',
    baseVigor: 5900,
    ingredients: { 'Puerro Grueso': 14, 'Jengibre': 10, 'Hierba Picante': 8 },
    description: 'El dulzor del puerro caramelizado equilibra el picante de la salsa.'
  },
  {
    id: 'curry-6',
    name: 'Curri de Setas "Espora"',
    type: 'curry',
    baseVigor: 4162,
    ingredients: { 'Seta Sabrosa': 14, 'Patata': 9 },
    description: 'Curri que adormece con la misma eficacia que el movimiento Espora.'
  },
  {
    id: 'curry-7',
    name: 'Curri "Bomba Huevo"',
    type: 'curry',
    baseVigor: 4523,
    ingredients: { 'Miel': 12, 'Manzana Selecta': 11, 'Huevo Selecto': 8, 'Patata': 4 },
    description: 'Un plato para los más pequeños, y preparado con mucho amor.'
  },
  {
    id: 'curry-8',
    name: 'Curri de Hamburguesa con Queso',
    type: 'curry',
    baseVigor: 1910,
    ingredients: { 'Leche Mu-mu': 8, 'Fiambre Vegetariano': 8 },
    description: 'Un plato tan enorme que dejaría anonadado hasta a un Snorlax.'
  },
  {
    id: 'curry-9',
    name: 'Estofado de Patata',
    type: 'curry',
    baseVigor: 3181,
    ingredients: { 'Leche Mu-mu': 10, 'Patata': 8, 'Seta Sabrosa': 4 },
    description: 'Su densa textura se logra hirviendo las Patatas hasta que se deshacen.'
  },
  {
    id: 'curry-10',
    name: 'Sopa Cremosa',
    type: 'curry',
    baseVigor: 814,
    ingredients: { 'Leche Mu-mu': 7 },
    description: 'Crema sencilla en la que destaca el sabor de la leche.'
  },
  {
    id: 'curry-11',
    name: 'Curri de Hamburguesa Vegetariana',
    type: 'curry',
    baseVigor: 856,
    ingredients: { 'Fiambre Vegetariano': 7 },
    description: 'Las hamburguesas de origen vegetal son las estrellas indiscutibles de este curri.'
  },
  {
    id: 'curry-12',
    name: 'Curri Meloso',
    type: 'curry',
    baseVigor: 839,
    ingredients: { 'Miel': 7 },
    description: 'Una generosa cantidad de Miel hace de este curri un favorito entre los niños.'
  },
  {
    id: 'curry-13',
    name: 'Curri Ninja',
    type: 'curry',
    baseVigor: 9445,
    ingredients: { 'Soja Verdegal': 24, 'Fiambre Vegetariano': 9, 'Puerro Grueso': 12, 'Seta Sabrosa': 5 },
    description: 'Se dice que este curri a base de tofu es el preferido de los ninjas.'
  },
  {
    id: 'curry-14',
    name: 'Curri con Escalope "Sequía"',
    type: 'curry',
    baseVigor: 1942,
    ingredients: { 'Fiambre Vegetariano': 10, 'Aceite Puro': 5 },
    description: 'El brillo del rebozado recién frito hace la boca agua solo con verlo.'
  },
  {
    id: 'curry-15',
    name: 'Curri de Tortilla Jugosa',
    type: 'curry',
    baseVigor: 2150,
    ingredients: { 'Huevo Selecto': 10, 'Siestomate': 6 },
    description: 'La tortilla de este curri está cocinada en su punto y se deshace en la boca.'
  },
  {
    id: 'curry-16',
    name: 'Curri de Habas "Corpulencia"',
    type: 'curry',
    baseVigor: 3372,
    ingredients: { 'Soja Verdegal': 12, 'Fiambre Vegetariano': 6, 'Hierba Picante': 4, 'Huevo Selecto': 4 },
    description: 'Un plato enorme que aporta todos los nutrientes para ganar corpulencia.'
  },
  {
    id: 'curry-17',
    name: 'Guiso de Maíz "Flexibilidad"',
    type: 'curry',
    baseVigor: 4670,
    ingredients: { 'Maíz Verdegal': 14, 'Leche Mu-mu': 8, 'Patata': 8 },
    description: 'Guiso suave y cremoso con un toque dulce por la leche y el maíz.'
  },
  {
    id: 'curry-18',
    name: 'Curri Keema de Maíz "Infierno"',
    type: 'curry',
    baseVigor: 13690,
    ingredients: { 'Hierba Picante': 27, 'Fiambre Vegetariano': 24, 'Maíz Verdegal': 14, 'Jengibre': 12 },
    description: 'Tras la inicial dulzura del maíz se pasa a niveles infernales de picante.'
  },
  {
    id: 'curry-19',
    name: 'Curri Picante "Puño Mareo"',
    type: 'curry',
    baseVigor: 5702,
    ingredients: { 'Café Estimulante': 11, 'Hierba Picante': 11, 'Miel': 11 },
    description: 'Un golpe de sabores dulces y picantes directo a tus papilas gustativas.'
  },
  {
    id: 'curry-20',
    name: 'Crema Vigorizante "Poder Oculto"',
    type: 'curry',
    baseVigor: 19061,
    ingredients: { 'Soja Verdegal': 28, 'Siestomate': 25, 'Seta Sabrosa': 23, 'Café Estimulante': 16 },
    description: 'Crema de tomate para empezar el día de la mejor forma posible.'
  },
  {
    id: 'curry-21',
    name: 'Curri Sukiyaki "Corte"',
    type: 'curry',
    baseVigor: 20655,
    ingredients: { 'Puerro Grueso': 27, 'Fiambre Vegetariano': 26, 'Miel': 26, 'Huevo Selecto': 22 },
    description: 'Curri agridulce con huevo duro y trozos de puerro como guarnición.'
  },
  {
    id: 'curry-22',
    name: 'Guiso Pumpkaboo "Imitación"',
    type: 'curry',
    baseVigor: 15621,
    ingredients: { 'Calabaza Suculenta': 10, 'Fiambre Vegetariano': 16, 'Patata': 18, 'Seta Sabrosa': 25 },
    description: 'Este adorable guiso es también un plato equilibrado.'
  },
  {
    id: 'curry-23',
    name: 'Aguacates Gratinados "Espesura"',
    type: 'curry',
    baseVigor: 82839,
    ingredients: { 'Aguacate': 22, 'Patata': 20, 'Leche Mu-mu': 41, 'Aceite Puro': 32 },
    description: 'La deliciosa salsa y el suave Aguacate combinan a la perfección.'
  },
  {
    id: 'curry-24',
    name: 'Bollito de Curri Verdegal',
    type: 'curry',
    baseVigor: 10945,
    ingredients: { 'Jengibre': 20, 'Hierba Picante': 20, 'Soja Verdegal': 8, 'Aceite Puro': 15 },
    description: 'Un bollito de curri con todo el sabor de Isla Verdegal.'
  },
  {
    id: 'curry-25',
    name: 'Udon al Curri "Bote"',
    type: 'curry',
    baseVigor: 25539,
    ingredients: { 'Jengibre': 39, 'Seta Sabrosa': 31, 'Hierba Picante': 22, 'Fiambre Vegetariano': 20 },
    description: 'La explosión de sabor de las especias despierta los sentidos.'
  },

  // --- ENSALADAS ---
  {
    id: 'salad-1',
    name: 'Ensalada de Jamón Vegetariano',
    type: 'salad',
    baseVigor: 978,
    ingredients: { 'Fiambre Vegetariano': 8 },
    description: 'Sencilla ensalada preparada con Fiambre Vegetariano.'
  },
  {
    id: 'salad-2',
    name: 'Ensalada de Siestomate',
    type: 'salad',
    baseVigor: 1045,
    ingredients: { 'Siestomate': 8 },
    description: 'Elaborada con una variedad de tomate que ayuda a conciliar el sueño.'
  },
  {
    id: 'salad-3',
    name: 'Ensalada de Manzana Selecta',
    type: 'salad',
    baseVigor: 855,
    ingredients: { 'Manzana Selecta': 8 },
    description: 'Sencilla ensalada con aderezo a base de puré de manzana.'
  },
  {
    id: 'salad-4',
    name: 'Ensalada César "Manto Níveo"',
    type: 'salad',
    baseVigor: 1898,
    ingredients: { 'Leche Mu-mu': 10, 'Fiambre Vegetariano': 6 },
    description: 'Ensalada de panceta cubierta por una generosa capa de queso rallado.'
  },
  {
    id: 'salad-5',
    name: 'Ensalada de Tofu "Onda Ígnea"',
    type: 'salad',
    baseVigor: 2114,
    ingredients: { 'Soja Verdegal': 10, 'Hierba Picante': 6 },
    description: 'Ensalada de tofu cubierta de salsa picante de color rojo intenso.'
  },
  {
    id: 'salad-6',
    name: 'Ensalada de Manzana y Queso "Atracción"',
    type: 'salad',
    baseVigor: 2655,
    ingredients: { 'Manzana Selecta': 15, 'Leche Mu-mu': 5, 'Aceite Puro': 5 },
    description: 'El sencillo aderezo resalta la sublime combinación de ingredientes.'
  },
  {
    id: 'salad-7',
    name: 'Ensalada de Maíz "Ataque Furia"',
    type: 'salad',
    baseVigor: 2785,
    ingredients: { 'Maíz Verdegal': 9, 'Aceite Puro': 8 },
    description: 'Se recomienda empezar atacando el montículo de maíz.'
  },
  {
    id: 'salad-8',
    name: 'Ensalada de Puerro "Inmunidad"',
    type: 'salad',
    baseVigor: 2845,
    ingredients: { 'Puerro Grueso': 10, 'Jengibre': 5 },
    description: 'El puerro crujiente de esta ensalada refuerza el sistema inmunitario.'
  },
  {
    id: 'salad-9',
    name: 'Ensalada con Mozzarella de Leche Mu-mu',
    type: 'salad',
    baseVigor: 2942,
    ingredients: { 'Leche Mu-mu': 12, 'Siestomate': 6, 'Aceite Puro': 5 },
    description: 'Sencilla ensalada a base de queso, tomates y un chorrito de aceite.'
  },
  {
    id: 'salad-10',
    name: 'Ensaladón "Fuerza Bruta"',
    type: 'salad',
    baseVigor: 3046,
    ingredients: { 'Fiambre Vegetariano': 9, 'Jengibre': 6, 'Huevo Selecto': 5, 'Patata': 3 },
    description: 'Generosa porción de ensalada que alimenta para un día entero.'
  },
  {
    id: 'salad-11',
    name: 'Ensalada de Tofu "Velo Agua"',
    type: 'salad',
    baseVigor: 3113,
    ingredients: { 'Soja Verdegal': 15, 'Siestomate': 9 },
    description: 'Ensalada con una guarnición a base de cubos de tofu gelatinoso.'
  },
  {
    id: 'salad-12',
    name: 'Ensalada de Carne al Cacao "Respondón"',
    type: 'salad',
    baseVigor: 3665,
    ingredients: { 'Cacao Relajante': 14, 'Fiambre Vegetariano': 9 },
    description: 'Ofrece un contraste de sabores entre la salsa salada y la de chocolate.'
  },
  {
    id: 'salad-13',
    name: 'Ensalada de Patata "Gula"',
    type: 'salad',
    baseVigor: 5040,
    ingredients: { 'Patata': 14, 'Huevo Selecto': 9, 'Fiambre Vegetariano': 7, 'Manzana Selecta': 6 },
    description: 'Ensalada de Patata con ligeras notas de Manzana Selecta.'
  },
  {
    id: 'salad-14',
    name: 'Ensalada de Jengibre "Sofoco"',
    type: 'salad',
    baseVigor: 5225,
    ingredients: { 'Hierba Picante': 17, 'Jengibre': 10, 'Siestomate': 8 },
    description: 'El aderezo especial a base de Jengibre aportada calidez al plato y al cuerpo.'
  },
  {
    id: 'salad-15',
    name: 'Ensalada de Setas "Espora"',
    type: 'salad',
    baseVigor: 5859,
    ingredients: { 'Seta Sabrosa': 17, 'Siestomate': 8, 'Aceite Puro': 8 },
    description: 'Ensalada rica en ingredientes que ayudan a mejorar la calidad del sueño.'
  },
  {
    id: 'salad-16',
    name: 'Ensalada de Fruta "Paz Mental"',
    type: 'salad',
    baseVigor: 7675,
    ingredients: { 'Manzana Selecta': 21, 'Miel': 16, 'Maíz Verdegal': 12 },
    description: 'Macedonia de un dulzor refrescante que reconforta el espíritu.'
  },
  {
    id: 'salad-17',
    name: 'Ensalada de Cola de Slowpoke a la Pimienta',
    type: 'salad',
    baseVigor: 8169,
    ingredients: { 'Cola de Slowpoke': 10, 'Hierba Picante': 10, 'Aceite Puro': 15 },
    description: 'El picante de la especia resalta el sabor dulce de la cola.'
  },
  {
    id: 'salad-18',
    name: 'Ensalada "Tajo Cruzado"',
    type: 'salad',
    baseVigor: 8755,
    ingredients: { 'Huevo Selecto': 20, 'Fiambre Vegetariano': 15, 'Maíz Verdegal': 11, 'Siestomate': 10 },
    description: 'Ensalada en la que todos los ingredientes se han picado muy fino.'
  },
  {
    id: 'salad-19',
    name: 'Ensalada Verdegal',
    type: 'salad',
    baseVigor: 11393,
    ingredients: { 'Aceite Puro': 22, 'Maíz Verdegal': 17, 'Siestomate': 14, 'Patata': 9 },
    description: 'Ensalada elaborada con ingredientes frescos de Isla Verdegal.'
  },
  {
    id: 'salad-20',
    name: 'Ensalada Ninja',
    type: 'salad',
    baseVigor: 11659,
    ingredients: { 'Puerro Grueso': 15, 'Soja Verdegal': 19, 'Seta Sabrosa': 12, 'Jengibre': 11 },
    description: 'Ningún ninja puede resistirse a esta ensalada de tofu.'
  },
  {
    id: 'salad-21',
    name: 'Ensalada con Aliño de Café "Competitivo"',
    type: 'salad',
    baseVigor: 11881,
    ingredients: { 'Café Estimulante': 28, 'Fiambre Vegetariano': 28, 'Aceite Puro': 22, 'Patata': 22 },
    description: 'Un chef trabajó sin descanso para mejorar esta receta aliñada con café.'
  },
  {
    id: 'salad-22',
    name: 'Corona de Ensalada "Tormenta Floral"',
    type: 'salad',
    baseVigor: 11881,
    ingredients: { 'Huevo Selecto': 25, 'Aceite Puro': 17, 'Patata': 15, 'Fiambre Vegetariano': 12 },
    description: 'El punto del huevo con ligereza le aporta una textura suave.'
  },
  {
    id: 'salad-23',
    name: 'Ensalada con Aliño de Yogur "Ácido Málico"',
    type: 'salad',
    baseVigor: 19293,
    ingredients: { 'Huevo Selecto': 35, 'Manzana Selecta': 28, 'Siestomate': 23, 'Leche Mu-mu': 18 },
    description: 'La acidez del vinagre de manzana y el yogur hacen de esta ensalada un manjar.'
  },
  {
    id: 'salad-24',
    name: 'Ensalada de Aguacate "Armadura Frágil"',
    type: 'salad',
    baseVigor: 23798,
    ingredients: { 'Aguacate': 14, 'Soja Verdegal': 18, 'Aceite Puro': 10 },
    description: 'Los tiernos ingredientes se deshacen en el paladar.'
  },
  {
    id: 'salad-25',
    name: 'Verduras al Vapor "Escaldar"',
    type: 'salad',
    baseVigor: 25356,
    ingredients: { 'Calabaza Suculenta': 20, 'Patata': 30, 'Maíz Verdegal': 18, 'Seta Sabrosa': 27 },
    description: 'Los ingredientes de corte grueso al vapor otorgan su textura suave.'
  },
  {
    id: 'salad-26',
    name: 'Nachos con Guacamole "Terratemblor"',
    type: 'salad',
    baseVigor: 84041,
    ingredients: { 'Aguacate': 28, 'Maíz Verdegal': 25, 'Hierba Picante': 30, 'Soja Verdegal': 32 },
    description: 'Los crujientes totopos son el acompañamiento perfecto para la salsa.'
  },

  // --- POSTRES Y BEBIDAS ---
  {
    id: 'dessert-1',
    name: 'Leche Mu-mu Caliente',
    type: 'dessert',
    baseVigor: 814,
    ingredients: { 'Leche Mu-mu': 7 },
    description: 'Calentar la leche Mu-mu resalta todavía más su dulzor natural.'
  },
  {
    id: 'dessert-2',
    name: 'Zumo de Manzana Selecta',
    type: 'dessert',
    baseVigor: 855,
    ingredients: { 'Manzana Selecta': 8 },
    description: 'Un zumo con cuerpo hecho a partir de las mejores manzanas.'
  },
  {
    id: 'dessert-3',
    name: 'Refresco Casero',
    type: 'dessert',
    baseVigor: 1079,
    ingredients: { 'Miel': 9 },
    description: 'Chispeante bebida gaseosa de elaboración casera.'
  },
  {
    id: 'dessert-4',
    name: 'Tarta de Manzana "Deseo"',
    type: 'dessert',
    baseVigor: 1748,
    ingredients: { 'Manzana Selecta': 12, 'Leche Mu-mu': 4 },
    description: 'Algunas porciones llevan trozos de manzana, es cuestión de suerte.'
  },
  {
    id: 'dessert-5',
    name: 'Boniatos "Peluche"',
    type: 'dessert',
    baseVigor: 1907,
    ingredients: { 'Patata': 9, 'Leche Mu-mu': 5 },
    description: 'Los boniatos maduros aportan todo el dulzor sin necesidad de añadir Miel.'
  },
  {
    id: 'dessert-6',
    name: 'Té de Jengibre "Ascuas"',
    type: 'dessert',
    baseVigor: 1913,
    ingredients: { 'Jengibre': 9, 'Manzana Selecta': 7 },
    description: 'La manzana rebaja el Jengibre y hace que sea más agradable al paladar.'
  },
  {
    id: 'dessert-7',
    name: 'Bizcocho de Soja "Liviano"',
    type: 'dessert',
    baseVigor: 1924,
    ingredients: { 'Huevo Selecto': 8, 'Soja Verdegal': 7 },
    description: 'Bizcocho de soja de textura ligera.'
  },
  {
    id: 'dessert-8',
    name: 'Zumo de Verduras "Acérrimo"',
    type: 'dessert',
    baseVigor: 1924,
    ingredients: { 'Siestomate': 9, 'Manzana Selecta': 7 },
    description: 'Zumo de sencilla elaboración con toques naturales dulces y ácidos.'
  },
  {
    id: 'dessert-9',
    name: 'Malasada Maxi',
    type: 'dessert',
    baseVigor: 3015,
    ingredients: { 'Aceite Puro': 10, 'Leche Mu-mu': 7, 'Miel': 6 },
    description: 'Pan frito especial elaborado según una receta de Alola.'
  },
  {
    id: 'dessert-10',
    name: 'Batido de Proteínas "Entusiasmo"',
    type: 'dessert',
    baseVigor: 3263,
    ingredients: { 'Soja Verdegal': 15, 'Cacao Relajante': 8 },
    description: 'Bebida dulce con la que premiarse tras un duro entrenamiento.'
  },
  {
    id: 'dessert-11',
    name: 'Tartaleta de Chocolate "Danza Pétalo"',
    type: 'dessert',
    baseVigor: 3314,
    ingredients: { 'Cacao Relajante': 11, 'Manzana Selecta': 11 },
    description: 'Alegre tartaleta con la que al comerla se esparcen pétalos.'
  },
  {
    id: 'dessert-12',
    name: 'Tarta de Chocolate "Dulce Aroma"',
    type: 'dessert',
    baseVigor: 3378,
    ingredients: { 'Miel': 9, 'Cacao Relajante': 8, 'Leche Mu-mu': 7 },
    description: 'Ni humanos ni Pokémon pueden resistirse a su dulce olor.'
  },
  {
    id: 'dessert-13',
    name: 'Batido "Beso Amoroso"',
    type: 'dessert',
    baseVigor: 4734,
    ingredients: { 'Manzana Selecta': 11, 'Leche Mu-mu': 9, 'Miel': 7, 'Cacao Relajante': 8 },
    description: 'Bebida relajante que alivia la fatiga y ayuda a conciliar el sueño.'
  },
  {
    id: 'dessert-14',
    name: 'Galletas de Jengibre "Impasible"',
    type: 'dessert',
    baseVigor: 4921,
    ingredients: { 'Miel': 14, 'Jengibre': 12, 'Cacao Relajante': 5, 'Huevo Selecto': 4 },
    description: 'Galletas que dan fuerzas para afrontar cualquier adversidad.'
  },
  {
    id: 'dessert-15',
    name: 'Té Reparador de Neroli',
    type: 'dessert',
    baseVigor: 5065,
    ingredients: { 'Jengibre': 11, 'Manzana Selecta': 15, 'Seta Sabrosa': 9 },
    description: 'Bebida reconstituyente, receta original del Profesor Neroli.'
  },
  {
    id: 'dessert-16',
    name: 'Dónuts de Soja "Potencia"',
    type: 'dessert',
    baseVigor: 5547,
    ingredients: { 'Aceite Puro': 12, 'Soja Verdegal': 16, 'Cacao Relajante': 7 },
    description: 'Los culturistas adoran estos roscos de soja en su punto ideal de fritura.'
  },
  {
    id: 'dessert-17',
    name: 'Palomitas "Explosión"',
    type: 'dessert',
    baseVigor: 6048,
    ingredients: { 'Maíz Verdegal': 15, 'Aceite Puro': 14, 'Leche Mu-mu': 7 },
    description: 'Preparadas al instante aplicando calor suficiente para provocar explosión.'
  },
  {
    id: 'dessert-18',
    name: 'Gelatina de Café "Madrugar"',
    type: 'dessert',
    baseVigor: 6793,
    ingredients: { 'Café Estimulante': 16, 'Leche Mu-mu': 14, 'Miel': 12 },
    description: 'Gelatina de café algo amarga que puede ayudarte a despertar más rápido.'
  },
  {
    id: 'dessert-19',
    name: 'Tiramisú de Maíz "Rompemoldes"',
    type: 'dessert',
    baseVigor: 7125,
    ingredients: { 'Café Estimulante': 14, 'Maíz Verdegal': 14, 'Leche Mu-mu': 12 },
    description: 'Receta de tiramisú que emplea maíz como único endulzante.'
  },
  {
    id: 'dessert-20',
    name: 'Flan con Frutas de Jigglypuff',
    type: 'dessert',
    baseVigor: 7594,
    ingredients: { 'Miel': 20, 'Huevo Selecto': 15, 'Leche Mu-mu': 10, 'Manzana Selecta': 10 },
    description: 'Flan muy especial, de consistencia elástica como la de un globo.'
  },
  {
    id: 'dessert-21',
    name: 'Batido "Ciclón de Hojas"',
    type: 'dessert',
    baseVigor: 8165,
    ingredients: { 'Aguacate': 18, 'Siestomate': 16, 'Leche Mu-mu': 14 },
    description: 'Cargado de nutrientes gracias al sol, ideal para la primera comida del día.'
  },
  {
    id: 'dessert-22',
    name: 'Panecillos de Maíz "Hora del Té"',
    type: 'dessert',
    baseVigor: 10925,
    ingredients: { 'Manzana Selecta': 20, 'Jengibre': 20, 'Maíz Verdegal': 18, 'Leche Mu-mu': 9 },
    description: 'Bollo crujiente con mermelada de manzana al Jengibre.'
  },
  {
    id: 'dessert-23',
    name: 'Macarons "Don Floral"',
    type: 'dessert',
    baseVigor: 13834,
    ingredients: { 'Cacao Relajante': 25, 'Huevo Selecto': 25, 'Miel': 17, 'Leche Mu-mu': 10 },
    description: 'El regalo ideal. Con ellos el éxito y la sonrisa están asegurados.'
  },
  {
    id: 'dessert-24',
    name: 'Cola Especiada "Chispa"',
    type: 'dessert',
    baseVigor: 17494,
    ingredients: { 'Manzana Selecta': 35, 'Jengibre': 20, 'Puerro Grueso': 20, 'Café Estimulante': 12 },
    description: 'El fuerte sabor de este refresco de cola te despertará de golpe.'
  },
  {
    id: 'dessert-25',
    name: 'Petisú Clodsire',
    type: 'dessert',
    baseVigor: 20885,
    ingredients: { 'Cacao Relajante': 30, 'Leche Mu-mu': 26, 'Café Estimulante': 24, 'Miel': 22 },
    description: 'Un petisú con relleno generoso y toque amargo en forma de Clodsire.'
  },
  {
    id: 'dessert-26',
    name: 'Tortitas "Cara Susto"',
    type: 'dessert',
    baseVigor: 24354,
    ingredients: { 'Calabaza Suculenta': 18, 'Huevo Selecto': 24, 'Miel': 32, 'Siestomate': 29 },
    description: 'Dulce al gusto, pero al mirarlo te da un susto.'
  },
  {
    id: 'dessert-27',
    name: 'Gofres de Chocolate "Recogemiel"',
    type: 'dessert',
    baseVigor: 25484,
    ingredients: { 'Miel': 38, 'Maíz Verdegal': 28, 'Aceite Puro': 28, 'Cacao Relajante': 21 },
    description: 'Dulce hecho con masa a base de cacao y bañado en Miel.'
  }
];

// Natures with precise modifiers
export const NATURES: Record<string, Nature> = {
  // Speed Up (+10% speed = 0.90 time)
  'Firme':   { name: 'Firme', upStat: 'Rapidez de ayuda', downStat: 'Buscar ingredientes', speedMod: 0.90, ingMod: 0.80, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 },
  'Huraña':  { name: 'Huraña', upStat: 'Rapidez de ayuda', downStat: 'Recuperar energía', speedMod: 0.90, ingMod: 1.0, skillMod: 1.0, energyMod: 0.80, expMod: 1.0 },
  'Pícara':  { name: 'Pícara', upStat: 'Rapidez de ayuda', downStat: 'Activar habilidad', speedMod: 0.90, ingMod: 1.0, skillMod: 0.80, energyMod: 1.0, expMod: 1.0 },
  'Audaz':   { name: 'Audaz', upStat: 'Rapidez de ayuda', downStat: 'EXP ganada', speedMod: 0.90, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 0.82 },

  // Speed Down (-10% speed = 1.10 time)
  'Osada':   { name: 'Osada', upStat: 'Recuperar energía', downStat: 'Rapidez de ayuda', speedMod: 1.10, ingMod: 1.0, skillMod: 1.0, energyMod: 1.20, expMod: 1.0 },
  'Modesta': { name: 'Modesta', upStat: 'Buscar ingredientes', downStat: 'Rapidez de ayuda', speedMod: 1.10, ingMod: 1.20, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 },
  'Serena':  { name: 'Serena', upStat: 'Activar habilidad', downStat: 'Rapidez de ayuda', speedMod: 1.10, ingMod: 1.0, skillMod: 1.20, energyMod: 1.0, expMod: 1.0 },
  'Miedosa': { name: 'Miedosa', upStat: 'EXP ganada', downStat: 'Rapidez de ayuda', speedMod: 1.10, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.18 },

  // Energy Up (+20%)
  'Dócil':   { name: 'Dócil', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 },
  'Afable':  { name: 'Afable', upStat: 'Buscar ingredientes', downStat: 'Recuperar energía', speedMod: 1.0, ingMod: 1.20, skillMod: 1.0, energyMod: 0.80, expMod: 1.0 },
  'Amable':  { name: 'Amable', upStat: 'Activar habilidad', downStat: 'Recuperar energía', speedMod: 1.0, ingMod: 1.0, skillMod: 1.20, energyMod: 0.80, expMod: 1.0 },
  'Activa':  { name: 'Activa', upStat: 'EXP ganada', downStat: 'Recuperar energía', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 0.80, expMod: 1.18 },

  // Ingredient Up (+20%)
  'Agitada': { name: 'Agitada', upStat: 'Recuperar energía', downStat: 'Buscar ingredientes', speedMod: 1.0, ingMod: 0.80, skillMod: 1.0, energyMod: 1.20, expMod: 1.0 },
  'Tímida':  { name: 'Tímida', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 },
  'Cauta':   { name: 'Cauta', upStat: 'Activar habilidad', downStat: 'Buscar ingredientes', speedMod: 1.0, ingMod: 0.80, skillMod: 1.20, energyMod: 1.0, expMod: 1.0 },
  'Alegre':  { name: 'Alegre', upStat: 'EXP ganada', downStat: 'Buscar ingredientes', speedMod: 1.0, ingMod: 0.80, skillMod: 1.0, energyMod: 1.0, expMod: 1.18 },

  // Skill Trigger Up (+20%)
  'Floja':   { name: 'Floja', upStat: 'Recuperar energía', downStat: 'Activar habilidad', speedMod: 1.0, ingMod: 1.0, skillMod: 0.80, energyMod: 1.20, expMod: 1.0 },
  'Alocada': { name: 'Alocada', upStat: 'Buscar ingredientes', downStat: 'Activar habilidad', speedMod: 1.0, ingMod: 1.20, skillMod: 0.80, energyMod: 1.0, expMod: 1.0 },
  'Rara':    { name: 'Rara', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 },
  'Ingenua': { name: 'Ingenua', upStat: 'EXP ganada', downStat: 'Activar habilidad', speedMod: 1.0, ingMod: 1.0, skillMod: 0.80, energyMod: 1.0, expMod: 1.18 },

  // EXP Up (+18%)
  'Plácida': { name: 'Plácida', upStat: 'Recuperar energía', downStat: 'EXP ganada', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.20, expMod: 0.82 },
  'Mansa':   { name: 'Mansa', upStat: 'Buscar ingredientes', downStat: 'EXP ganada', speedMod: 1.0, ingMod: 1.20, skillMod: 1.0, energyMod: 1.0, expMod: 0.82 },
  'Grosera': { name: 'Grosera', upStat: 'Activar habilidad', downStat: 'EXP ganada', speedMod: 1.0, ingMod: 1.0, skillMod: 1.20, energyMod: 1.0, expMod: 0.82 },
  'Seria':   { name: 'Seria', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 },
  'Fuerte':  { name: 'Fuerte', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 }
};

export function parseNature(raw: string): Nature {
  const firstWord = raw.trim().split(/[\s(]/)[0];
  if (NATURES[firstWord]) {
    return NATURES[firstWord];
  }
  // Try case-insensitive lookup
  for (const [k, v] of Object.entries(NATURES)) {
    if (k.toLowerCase() === firstWord.toLowerCase()) return v;
  }
  return { name: firstWord || 'Dócil', speedMod: 1.0, ingMod: 1.0, skillMod: 1.0, energyMod: 1.0, expMod: 1.0 };
}

// Subskills dictionary
export const KNOWN_SUBSKILLS: Record<string, { tier: 'white' | 'blue' | 'gold'; description: string }> = {
  'Busca bayas S': { tier: 'gold', description: 'Aumenta en 1 el número de bayas que encuentra el Pokémon cada vez.' },
  'Bonus ayuda': { tier: 'gold', description: 'Reduce un 5% el tiempo que tardan en ayudar los miembros del equipo.' },
  'Bonus EXP al dormir': { tier: 'gold', description: 'Aumenta un 14% los puntos de experiencia que gana el equipo al dormir.' },
  'Bonus EXP de estudio': { tier: 'gold', description: 'Aumenta un 6% la cantidad de EXP de estudio obtenidos.' },
  'Bonus fragmentos sueños': { tier: 'gold', description: 'Aumenta un 6% los fragmentos de sueños obtenidos.' },
  'Bonus recupera energía': { tier: 'gold', description: 'Multiplica por 1,14 la energía que recupera el equipo al dormir.' },
  'Nivel habilidad L': { tier: 'gold', description: 'Aumenta 3 niveles la habilidad principal de este Pokémon.' },

  'Velocidad ayuda M': { tier: 'blue', description: 'Reduce un 14% el tiempo que tarda en ayudar el Pokémon.' },
  'Más ingredientes M': { tier: 'blue', description: 'Aumenta un 36% la probabilidad de encontrar ingredientes.' },
  'Activación M': { tier: 'blue', description: 'Aumenta la probabilidad de que el Pokémon utilice su habilidad principal.' },
  'Inventario M': { tier: 'blue', description: 'Aumenta en 12 el número de bayas e ingredientes que puede tener.' },
  'Inventario L': { tier: 'blue', description: 'Aumenta en 18 el número de bayas e ingredientes que puede tener.' },
  'Nivel habilidad M': { tier: 'blue', description: 'Aumenta 2 niveles la habilidad principal de este Pokémon.' },

  'Velocidad ayuda S': { tier: 'white', description: 'Reduce un 7% el tiempo que tarda en ayudar el Pokémon.' },
  'Más ingredientes S': { tier: 'white', description: 'Aumenta un 18% la probabilidad de encontrar ingredientes.' },
  'Activación S': { tier: 'white', description: 'Aumenta ligeramente la probabilidad de usar su habilidad principal.' },
  'Inventario S': { tier: 'white', description: 'Aumenta en 6 el número de bayas e ingredientes que puede tener.' },
  'Nivel habilidad S': { tier: 'white', description: 'Aumenta 1 nivel la habilidad principal de este Pokémon.' }
};

// All in-game Berries with type and base vigor at Lv 1 (18 official Pokemon types)
export const BERRIES: Record<string, { type: string; baseVigor: number; icon: string }> = {
  'Baya Ango':   { type: 'Psíquico', baseVigor: 26, icon: '🔮' },
  'Baya Oram':   { type: 'Fantasma', baseVigor: 26, icon: '👻' },
  'Baya Aranja': { type: 'Agua', baseVigor: 31, icon: '💧' },
  'Baya Caquic': { type: 'Normal', baseVigor: 25, icon: '⚪' },
  'Baya Wiki':   { type: 'Siniestro', baseVigor: 31, icon: '🌑' },
  'Baya Zidra':  { type: 'Roca', baseVigor: 30, icon: '🪨' },
  'Baya Rudion': { type: 'Planta', baseVigor: 30, icon: '🌿' },
  'Baya Higog':  { type: 'Tierra', baseVigor: 30, icon: '🏜️' },
  'Baya Uvav':   { type: 'Eléctrico', baseVigor: 25, icon: '⚡' },
  'Baya Meloc':  { type: 'Hada', baseVigor: 26, icon: '🌸' },
  'Baya Zanama': { type: 'Fuego', baseVigor: 27, icon: '🔥' },
  'Baya Plama':  { type: 'Volador', baseVigor: 24, icon: '🪶' },
  'Baya Atania': { type: 'Veneno', baseVigor: 32, icon: '🧪' },
  'Baya Zreza':  { type: 'Lucha', baseVigor: 27, icon: '🥊' },
  'Baya Safre':  { type: 'Hielo', baseVigor: 35, icon: '❄️' },
  'Baya Andano': { type: 'Acero', baseVigor: 33, icon: '⚙️' },
  'Baya Rimoya': { type: 'Dragón', baseVigor: 35, icon: '🐉' },
  'Baya Ziuela': { type: 'Bicho', baseVigor: 27, icon: '🐛' },
  // Compatibilidad con registros previos o variantes internacionales
  'Baya Drasi':  { type: 'Dragón', baseVigor: 35, icon: '🐉' },
  'Baya Yache':  { type: 'Dragón', baseVigor: 35, icon: '🐉' },
  'Baya Lum':    { type: 'Bicho', baseVigor: 27, icon: '🐛' }
};

// The 18 unique canonical berries for UI selectors (one per Pokemon elemental type)
export const CANONICAL_BERRIES = [
  'Baya Caquic', // Normal
  'Baya Zanama', // Fuego
  'Baya Aranja', // Agua
  'Baya Uvav',   // Eléctrico
  'Baya Rudion', // Planta
  'Baya Safre',  // Hielo
  'Baya Zreza',  // Lucha
  'Baya Atania', // Veneno
  'Baya Higog',  // Tierra
  'Baya Plama',  // Volador
  'Baya Ango',   // Psíquico
  'Baya Ziuela', // Bicho
  'Baya Zidra',  // Roca
  'Baya Oram',   // Fantasma
  'Baya Rimoya', // Dragón
  'Baya Andano', // Acero
  'Baya Wiki',   // Siniestro
  'Baya Meloc'   // Hada
] as const;

export function normalizeBerryName(berryName?: string): string {
  if (!berryName) return 'Baya Caquic';
  const clean = berryName.trim();
  const lower = clean.toLowerCase();
  if (lower.includes('drasi') || lower.includes('yache') || lower.includes('rimoya')) {
    return 'Baya Rimoya';
  }
  if (lower.includes('lum')) {
    return 'Baya Ziuela';
  }
  if (BERRIES[clean]) {
    return clean;
  }
  for (const b of CANONICAL_BERRIES) {
    if (b.toLowerCase() === lower || b.toLowerCase().replace('baya ', '') === lower.replace('baya ', '')) {
      return b;
    }
  }
  return clean;
}

// Calculate berry value based on level
export function getBerryVigor(berryName: string, level: number): number {
  const meta = BERRIES[berryName];
  const base = meta ? meta.baseVigor : 28;
  // Pokémon Sleep scaling formula: base + level - 1 + small tier bumps at 25/50
  let vigor = base + (level - 1);
  if (level >= 25) vigor += Math.floor((level - 25) * 0.4);
  if (level >= 50) vigor += Math.floor((level - 50) * 0.6);
  return vigor;
}

// Islands in Pokémon Sleep
export const ISLANDS = [
  {
    id: 'greengrass',
    name: 'Isla Verdegal',
    description: '3 bayas aleatorias cada semana',
    fixedBerries: []
  },
  {
    id: 'cyan',
    name: 'Playa Turquesa',
    description: 'Bayas fijas: Agua, Volador, Hada',
    fixedBerries: ['Baya Aranja', 'Baya Plama', 'Baya Meloc']
  },
  {
    id: 'taupe',
    name: 'Cueva Pardita',
    description: 'Bayas fijas: Fuego, Roca, Tierra',
    fixedBerries: ['Baya Zanama', 'Baya Zidra', 'Baya Higog']
  },
  {
    id: 'snowdrop',
    name: 'Tundra Nievenveo',
    description: 'Bayas fijas: Normal, Hielo, Siniestro',
    fixedBerries: ['Baya Caquic', 'Baya Safre', 'Baya Wiki']
  },
  {
    id: 'lapis',
    name: 'Lago Lapis',
    description: 'Bayas fijas: Planta, Psíquico, Lucha',
    fixedBerries: ['Baya Rudion', 'Baya Ango', 'Baya Zreza']
  },
  {
    id: 'powerplant',
    name: 'Antigua Central Eléctrica Dorada',
    description: 'Bayas fijas: Eléctrico, Fantasma, Acero',
    fixedBerries: ['Baya Uvav', 'Baya Oram', 'Baya Andano']
  }
];
