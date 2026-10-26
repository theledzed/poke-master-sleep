import { Specialty } from '../types/pokemon';

export interface MasterSpecies {
  id: string;
  dexNumber: number;
  name: string;
  specialty: Specialty;
  type: string;
  berry: string;
  mainSkill: string;
  baseFrequency: number;
  frequencyStr: string;
  ingredientRate: number; // percentage (e.g. 25.7)
  skillRate: number;      // percentage (e.g. 1.9)
  carryLimit: number;
  friendshipPoints: number;
  evolutionCount: number;
  evolutionLeft: number;
  isFullyEvolved: boolean;
  sleepType: string;
  ingredients: [string, string, string];
  ingredientSlots: {
    slot1: { name: string; c1: number; c2: number; c3: number };
    slot2: { name: string; c2: number; c3: number };
    slot3: { name: string; c3: number };
  };
  avatarUrl: string;
}

export const SPECIES_MASTER_DATA: MasterSpecies[] = [
  {
    "id": "bulbasaur",
    "dexNumber": 1,
    "name": "Bulbasaur",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4400,
    "frequencyStr": "1h 13min 20s",
    "ingredientRate": 25.7,
    "skillRate": 1.9,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Siestomate",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Patata",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/bulbasaur.png"
  },
  {
    "id": "ivysaur",
    "dexNumber": 2,
    "name": "Ivysaur",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 25.5,
    "skillRate": 1.9,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Siestomate",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Patata",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/ivysaur.png"
  },
  {
    "id": "venusaur",
    "dexNumber": 3,
    "name": "Venusaur",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 26.6,
    "skillRate": 2.1,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Siestomate",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Patata",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/venusaur.png"
  },
  {
    "id": "charmander",
    "dexNumber": 4,
    "name": "Charmander",
    "specialty": "Ingredientes",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 20.1,
    "skillRate": 1.1,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Jengibre",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/charmander.png"
  },
  {
    "id": "charmeleon",
    "dexNumber": 5,
    "name": "Charmeleon",
    "specialty": "Ingredientes",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 22.7,
    "skillRate": 1.6,
    "carryLimit": 15,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Jengibre",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/charmeleon.png"
  },
  {
    "id": "charizard",
    "dexNumber": 6,
    "name": "Charizard",
    "specialty": "Ingredientes",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 22.4,
    "skillRate": 1.6,
    "carryLimit": 19,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Jengibre",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/charizard.png"
  },
  {
    "id": "squirtle",
    "dexNumber": 7,
    "name": "Squirtle",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 27.1,
    "skillRate": 2,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/squirtle.png"
  },
  {
    "id": "wartortle",
    "dexNumber": 8,
    "name": "Wartortle",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 27.1,
    "skillRate": 2,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/wartortle.png"
  },
  {
    "id": "blastoise",
    "dexNumber": 9,
    "name": "Blastoise",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 27.5,
    "skillRate": 2.1,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/blastoise.png"
  },
  {
    "id": "caterpie",
    "dexNumber": 10,
    "name": "Caterpie",
    "specialty": "Bayas",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4400,
    "frequencyStr": "1h 13min 20s",
    "ingredientRate": 17.9,
    "skillRate": 0.8,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Siestomate",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/caterpie.png"
  },
  {
    "id": "metapod",
    "dexNumber": 11,
    "name": "Metapod",
    "specialty": "Bayas",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4200,
    "frequencyStr": "1h 10min 0s",
    "ingredientRate": 20.8,
    "skillRate": 1.8,
    "carryLimit": 13,
    "friendshipPoints": 7,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Siestomate",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/metapod.png"
  },
  {
    "id": "butterfree",
    "dexNumber": 12,
    "name": "Butterfree",
    "specialty": "Bayas",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 19.7,
    "skillRate": 1.4,
    "carryLimit": 21,
    "friendshipPoints": 15,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Siestomate",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/butterfree.png"
  },
  {
    "id": "rattata",
    "dexNumber": 19,
    "name": "Rattata",
    "specialty": "Bayas",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4900,
    "frequencyStr": "1h 21min 40s",
    "ingredientRate": 23.7,
    "skillRate": 3,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Soja Verdegal",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/rattata.png"
  },
  {
    "id": "raticate",
    "dexNumber": 20,
    "name": "Raticate",
    "specialty": "Bayas",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2950,
    "frequencyStr": "49 min 10s",
    "ingredientRate": 23.7,
    "skillRate": 3,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Soja Verdegal",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/raticate.png"
  },
  {
    "id": "ekans",
    "dexNumber": 23,
    "name": "Ekans",
    "specialty": "Bayas",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 5000,
    "frequencyStr": "1h 23min 20s",
    "ingredientRate": 23.5,
    "skillRate": 3.3,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Huevo Selecto",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/ekans.png"
  },
  {
    "id": "arbok",
    "dexNumber": 24,
    "name": "Arbok",
    "specialty": "Bayas",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 26.4,
    "skillRate": 5.7,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Huevo Selecto",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/arbok.png"
  },
  {
    "id": "pikachu",
    "dexNumber": 25,
    "name": "Pikachu",
    "specialty": "Bayas",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 20.7,
    "skillRate": 2.1,
    "carryLimit": 17,
    "friendshipPoints": 7,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Jengibre",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/pikachu.png"
  },
  {
    "id": "pikachu-low-key",
    "dexNumber": 25,
    "name": "Pikachu (Low Key)",
    "specialty": "Bayas",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "unknown",
    "baseFrequency": 0,
    "frequencyStr": "0 min 0s",
    "ingredientRate": 0,
    "skillRate": 0,
    "carryLimit": 0,
    "friendshipPoints": 0,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Cacao Relajante",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 2,
        "c2": 2,
        "c3": 2
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/pikachulowkey.png"
  },
  {
    "id": "pikachu-holiday",
    "dexNumber": 25,
    "name": "Pikachu (Holiday)",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 13.1,
    "skillRate": 4.2,
    "carryLimit": 20,
    "friendshipPoints": 7,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Jengibre",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/pikachuholiday.png"
  },
  {
    "id": "pikachu-halloween",
    "dexNumber": 25,
    "name": "Pikachu (Halloween)",
    "specialty": "Bayas",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 21.8,
    "skillRate": 2.8,
    "carryLimit": 18,
    "friendshipPoints": 7,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Jengibre",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/pikachuhalloween.png"
  },
  {
    "id": "pikachu-captain",
    "dexNumber": 25,
    "name": "Pikachu (Captain)",
    "specialty": "Bayas",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 17.5,
    "skillRate": 1.8,
    "carryLimit": 21,
    "friendshipPoints": 7,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Jengibre",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/pikachucaptain.png"
  },
  {
    "id": "raichu",
    "dexNumber": 26,
    "name": "Raichu",
    "specialty": "Bayas",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2200,
    "frequencyStr": "36 min 40s",
    "ingredientRate": 22.4,
    "skillRate": 3.2,
    "carryLimit": 21,
    "friendshipPoints": 18,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Jengibre",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/raichu.png"
  },
  {
    "id": "sandshrew",
    "dexNumber": 27,
    "name": "Sandshrew",
    "specialty": "Habilidades",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 5300,
    "frequencyStr": "1h 28min 20s",
    "ingredientRate": 10,
    "skillRate": 4.6,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Calabaza Suculenta",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Patata",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/sandshrew.png"
  },
  {
    "id": "sandslash",
    "dexNumber": 28,
    "name": "Sandslash",
    "specialty": "Habilidades",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 10.8,
    "skillRate": 4.3,
    "carryLimit": 17,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Calabaza Suculenta",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Patata",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/sandslash.png"
  },
  {
    "id": "clefairy",
    "dexNumber": 35,
    "name": "Clefairy",
    "specialty": "Bayas",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Metrónomo",
    "baseFrequency": 4000,
    "frequencyStr": "1h 6min 40s",
    "ingredientRate": 16.8,
    "skillRate": 3.6,
    "carryLimit": 16,
    "friendshipPoints": 7,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Miel",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/clefairy.png"
  },
  {
    "id": "clefable",
    "dexNumber": 36,
    "name": "Clefable",
    "specialty": "Bayas",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Metrónomo",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 16.8,
    "skillRate": 4,
    "carryLimit": 24,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Miel",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/clefable.png"
  },
  {
    "id": "vulpix",
    "dexNumber": 37,
    "name": "Vulpix",
    "specialty": "Bayas",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 4700,
    "frequencyStr": "1h 18min 20s",
    "ingredientRate": 16.8,
    "skillRate": 3.2,
    "carryLimit": 13,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Soja Verdegal",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/vulpix.png"
  },
  {
    "id": "vulpix-alola",
    "dexNumber": 37,
    "name": "Vulpix (Alola)",
    "specialty": "Bayas",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Superútil S",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 23,
    "skillRate": 2.8,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/vulpixalola.png"
  },
  {
    "id": "ninetales",
    "dexNumber": 38,
    "name": "Ninetales",
    "specialty": "Bayas",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 16.4,
    "skillRate": 2.9,
    "carryLimit": 23,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Soja Verdegal",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/ninetales.png"
  },
  {
    "id": "ninetales-alola",
    "dexNumber": 38,
    "name": "Ninetales (Alola)",
    "specialty": "Bayas",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Superútil S",
    "baseFrequency": 2900,
    "frequencyStr": "48 min 20s",
    "ingredientRate": 23.2,
    "skillRate": 2.8,
    "carryLimit": 20,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/ninetalesalola.png"
  },
  {
    "id": "jigglypuff",
    "dexNumber": 39,
    "name": "Jigglypuff",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 3900,
    "frequencyStr": "1h 5min 0s",
    "ingredientRate": 18.2,
    "skillRate": 4.3,
    "carryLimit": 9,
    "friendshipPoints": 7,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Miel",
      "Aceite Puro",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/jigglypuff.png"
  },
  {
    "id": "wigglytuff",
    "dexNumber": 40,
    "name": "Wigglytuff",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 2750,
    "frequencyStr": "45 min 50s",
    "ingredientRate": 19.1,
    "skillRate": 4,
    "carryLimit": 22,
    "friendshipPoints": 16,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Miel",
      "Aceite Puro",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/wigglytuff.png"
  },
  {
    "id": "diglett",
    "dexNumber": 50,
    "name": "Diglett",
    "specialty": "Ingredientes",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4300,
    "frequencyStr": "1h 11min 40s",
    "ingredientRate": 19.2,
    "skillRate": 2.1,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Puerro Grueso",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/diglett.png"
  },
  {
    "id": "dugtrio",
    "dexNumber": 51,
    "name": "Dugtrio",
    "specialty": "Ingredientes",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2650,
    "frequencyStr": "44 min 10s",
    "ingredientRate": 19,
    "skillRate": 2,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Puerro Grueso",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/dugtrio.png"
  },
  {
    "id": "meowth",
    "dexNumber": 52,
    "name": "Meowth",
    "specialty": "Habilidades",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 4400,
    "frequencyStr": "1h 13min 20s",
    "ingredientRate": 16.3,
    "skillRate": 4.2,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Fiambre Vegetariano",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/meowth.png"
  },
  {
    "id": "persian",
    "dexNumber": 53,
    "name": "Persian",
    "specialty": "Habilidades",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 16.9,
    "skillRate": 4.4,
    "carryLimit": 12,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Fiambre Vegetariano",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/persian.png"
  },
  {
    "id": "psyduck",
    "dexNumber": 54,
    "name": "Psyduck",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5400,
    "frequencyStr": "1h 30min 0s",
    "ingredientRate": 13.6,
    "skillRate": 12.6,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Manzana Selecta",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/psyduck.png"
  },
  {
    "id": "golduck",
    "dexNumber": 55,
    "name": "Golduck",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 16.2,
    "skillRate": 12.5,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Cacao Relajante",
      "Manzana Selecta",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/golduck.png"
  },
  {
    "id": "mankey",
    "dexNumber": 56,
    "name": "Mankey",
    "specialty": "Bayas",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4200,
    "frequencyStr": "1h 10min 0s",
    "ingredientRate": 19.7,
    "skillRate": 2.2,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/mankey.png"
  },
  {
    "id": "primeape",
    "dexNumber": 57,
    "name": "Primeape",
    "specialty": "Bayas",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 20,
    "skillRate": 2.4,
    "carryLimit": 17,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/primeape.png"
  },
  {
    "id": "growlithe",
    "dexNumber": 58,
    "name": "Growlithe",
    "specialty": "Habilidades",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Superútil S",
    "baseFrequency": 4300,
    "frequencyStr": "1h 11min 40s",
    "ingredientRate": 13.8,
    "skillRate": 5,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Hierba Picante",
      "Fiambre Vegetariano",
      "Leche Mu-mu"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Leche Mu-mu",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/growlithe.png"
  },
  {
    "id": "arcanine",
    "dexNumber": 59,
    "name": "Arcanine",
    "specialty": "Habilidades",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Superútil S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 13.6,
    "skillRate": 4.9,
    "carryLimit": 16,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Hierba Picante",
      "Fiambre Vegetariano",
      "Leche Mu-mu"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Leche Mu-mu",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/arcanine.png"
  },
  {
    "id": "bellsprout",
    "dexNumber": 69,
    "name": "Bellsprout",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 5200,
    "frequencyStr": "1h 26min 40s",
    "ingredientRate": 23.3,
    "skillRate": 3.9,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Siestomate",
      "Patata",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/bellsprout.png"
  },
  {
    "id": "weepinbell",
    "dexNumber": 70,
    "name": "Weepinbell",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 23.5,
    "skillRate": 4,
    "carryLimit": 12,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Siestomate",
      "Patata",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/weepinbell.png"
  },
  {
    "id": "victreebel",
    "dexNumber": 71,
    "name": "Victreebel",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 23.3,
    "skillRate": 3.9,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Siestomate",
      "Patata",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/victreebel.png"
  },
  {
    "id": "geodude",
    "dexNumber": 74,
    "name": "Geodude",
    "specialty": "Ingredientes",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5700,
    "frequencyStr": "1h 35min 0s",
    "ingredientRate": 28.1,
    "skillRate": 5.2,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Patata",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/geodude.png"
  },
  {
    "id": "graveler",
    "dexNumber": 75,
    "name": "Graveler",
    "specialty": "Ingredientes",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4000,
    "frequencyStr": "1h 6min 40s",
    "ingredientRate": 27.2,
    "skillRate": 4.8,
    "carryLimit": 12,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Patata",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/graveler.png"
  },
  {
    "id": "golem",
    "dexNumber": 76,
    "name": "Golem",
    "specialty": "Ingredientes",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 28,
    "skillRate": 5.2,
    "carryLimit": 16,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Patata",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/golem.png"
  },
  {
    "id": "slowpoke",
    "dexNumber": 79,
    "name": "Slowpoke",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 5700,
    "frequencyStr": "1h 35min 0s",
    "ingredientRate": 15.1,
    "skillRate": 7.8,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Cacao Relajante",
      "Cola de Slowpoke",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cola de Slowpoke",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/slowpoke.png"
  },
  {
    "id": "slowbro",
    "dexNumber": 80,
    "name": "Slowbro",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 19.7,
    "skillRate": 8,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Cacao Relajante",
      "Cola de Slowpoke",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cola de Slowpoke",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/slowbro.png"
  },
  {
    "id": "magnemite",
    "dexNumber": 81,
    "name": "Magnemite",
    "specialty": "Habilidades",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 5800,
    "frequencyStr": "1h 36min 40s",
    "ingredientRate": 18.2,
    "skillRate": 6.4,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Hierba Picante",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/magnemite.png"
  },
  {
    "id": "magneton",
    "dexNumber": 82,
    "name": "Magneton",
    "specialty": "Habilidades",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 4000,
    "frequencyStr": "1h 6min 40s",
    "ingredientRate": 18.2,
    "skillRate": 6.3,
    "carryLimit": 11,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Hierba Picante",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/magneton.png"
  },
  {
    "id": "farfetch-d",
    "dexNumber": 83,
    "name": "Farfetch'd",
    "specialty": "Ingredientes",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 16,
    "skillRate": 4.3,
    "carryLimit": 18,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Puerro Grueso",
      "Fiambre Vegetariano",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Puerro Grueso",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 8,
        "c3": 13
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 12
      }
    },
    "avatarUrl": "/images/avatar/portrait/farfetchd.png"
  },
  {
    "id": "doduo",
    "dexNumber": 84,
    "name": "Doduo",
    "specialty": "Bayas",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 18.4,
    "skillRate": 2,
    "carryLimit": 13,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/doduo.png"
  },
  {
    "id": "dodrio",
    "dexNumber": 85,
    "name": "Dodrio",
    "specialty": "Bayas",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2300,
    "frequencyStr": "38 min 20s",
    "ingredientRate": 18.4,
    "skillRate": 2,
    "carryLimit": 21,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/dodrio.png"
  },
  {
    "id": "gastly",
    "dexNumber": 92,
    "name": "Gastly",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 14.4,
    "skillRate": 1.5,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Seta Sabrosa",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/gastly.png"
  },
  {
    "id": "haunter",
    "dexNumber": 93,
    "name": "Haunter",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 15.7,
    "skillRate": 2.2,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Seta Sabrosa",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/haunter.png"
  },
  {
    "id": "gengar",
    "dexNumber": 94,
    "name": "Gengar",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2200,
    "frequencyStr": "36 min 40s",
    "ingredientRate": 16.1,
    "skillRate": 2.4,
    "carryLimit": 18,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Seta Sabrosa",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/gengar.png"
  },
  {
    "id": "onix",
    "dexNumber": 95,
    "name": "Onix",
    "specialty": "Bayas",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 13.2,
    "skillRate": 2.3,
    "carryLimit": 22,
    "friendshipPoints": 16,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Fiambre Vegetariano",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/onix.png"
  },
  {
    "id": "cubone",
    "dexNumber": 104,
    "name": "Cubone",
    "specialty": "Bayas",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4800,
    "frequencyStr": "1h 20min 0s",
    "ingredientRate": 22.3,
    "skillRate": 4.4,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Jengibre",
      "Cacao Relajante",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/cubone.png"
  },
  {
    "id": "marowak",
    "dexNumber": 105,
    "name": "Marowak",
    "specialty": "Bayas",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 22.5,
    "skillRate": 4.5,
    "carryLimit": 15,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Jengibre",
      "Cacao Relajante",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/marowak.png"
  },
  {
    "id": "chansey",
    "dexNumber": 113,
    "name": "Chansey",
    "specialty": "Ingredientes",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 23.6,
    "skillRate": 2.3,
    "carryLimit": 15,
    "friendshipPoints": 16,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Patata",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Miel",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/chansey.png"
  },
  {
    "id": "kangaskhan",
    "dexNumber": 115,
    "name": "Kangaskhan",
    "specialty": "Ingredientes",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2650,
    "frequencyStr": "44 min 10s",
    "ingredientRate": 22.2,
    "skillRate": 3.2,
    "carryLimit": 21,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Jengibre",
      "Patata",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/kangaskhan.png"
  },
  {
    "id": "mr-mime",
    "dexNumber": 122,
    "name": "Mr. Mime",
    "specialty": "Ingredientes",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Skill Copy (Mimic)",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 21.6,
    "skillRate": 3.9,
    "carryLimit": 17,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Patata",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/mrmime.png"
  },
  {
    "id": "pinsir",
    "dexNumber": 127,
    "name": "Pinsir",
    "specialty": "Ingredientes",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 21.6,
    "skillRate": 3.1,
    "carryLimit": 24,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Manzana Selecta",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 5,
        "c3": 8
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/pinsir.png"
  },
  {
    "id": "ditto",
    "dexNumber": 132,
    "name": "Ditto",
    "specialty": "Ingredientes",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Transformación (Copia habilidades)",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 20.1,
    "skillRate": 3.6,
    "carryLimit": 17,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Aceite Puro",
      "Puerro Grueso",
      "Cola de Slowpoke"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Cola de Slowpoke",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/ditto.png"
  },
  {
    "id": "eevee",
    "dexNumber": 133,
    "name": "Eevee",
    "specialty": "Habilidades",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3700,
    "frequencyStr": "1h 1min 40s",
    "ingredientRate": 19.2,
    "skillRate": 5.5,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/eevee.png"
  },
  {
    "id": "eevee-halloween",
    "dexNumber": 133,
    "name": "Eevee (Halloween)",
    "specialty": "Habilidades",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 12,
    "skillRate": 4.6,
    "carryLimit": 18,
    "friendshipPoints": 5,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Cacao Relajante",
      "Leche Mu-mu"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Leche Mu-mu",
        "c3": 9
      }
    },
    "avatarUrl": "/images/avatar/portrait/eeveehalloween.png"
  },
  {
    "id": "eevee-holiday",
    "dexNumber": 133,
    "name": "Eevee (Holiday)",
    "specialty": "Bayas",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 15.6,
    "skillRate": 3.2,
    "carryLimit": 20,
    "friendshipPoints": 5,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/eeveeholiday.png"
  },
  {
    "id": "vaporeon",
    "dexNumber": 134,
    "name": "Vaporeon",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 21.2,
    "skillRate": 6.1,
    "carryLimit": 13,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/vaporeon.png"
  },
  {
    "id": "jolteon",
    "dexNumber": 135,
    "name": "Jolteon",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Superútil S",
    "baseFrequency": 2200,
    "frequencyStr": "36 min 40s",
    "ingredientRate": 15.1,
    "skillRate": 3.9,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/jolteon.png"
  },
  {
    "id": "flareon",
    "dexNumber": 136,
    "name": "Flareon",
    "specialty": "Habilidades",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 18.5,
    "skillRate": 5.2,
    "carryLimit": 14,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/flareon.png"
  },
  {
    "id": "dratini",
    "dexNumber": 147,
    "name": "Dratini",
    "specialty": "Ingredientes",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 5000,
    "frequencyStr": "1h 23min 20s",
    "ingredientRate": 25,
    "skillRate": 2,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Maíz Verdegal",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/dratini.png"
  },
  {
    "id": "dragonair",
    "dexNumber": 148,
    "name": "Dragonair",
    "specialty": "Ingredientes",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 26.2,
    "skillRate": 2.5,
    "carryLimit": 12,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Maíz Verdegal",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/dragonair.png"
  },
  {
    "id": "dragonite",
    "dexNumber": 149,
    "name": "Dragonite",
    "specialty": "Ingredientes",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 26.4,
    "skillRate": 2.6,
    "carryLimit": 20,
    "friendshipPoints": 25,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Maíz Verdegal",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/dragonite.png"
  },
  {
    "id": "mewtwo",
    "dexNumber": 150,
    "name": "Mewtwo",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Berry Zone (Psystrike)",
    "baseFrequency": 2300,
    "frequencyStr": "38 min 20s",
    "ingredientRate": 16,
    "skillRate": 2.9,
    "carryLimit": 24,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Soja Verdegal",
      "Maíz Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/mewtwo.png"
  },
  {
    "id": "mew",
    "dexNumber": 151,
    "name": "Mew",
    "specialty": "Todo",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Metrónomo",
    "baseFrequency": 2900,
    "frequencyStr": "48 min 20s",
    "ingredientRate": 20,
    "skillRate": 4,
    "carryLimit": 26,
    "friendshipPoints": 25,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Hierba Picante",
      "unknown"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 2,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 4,
        "c3": 4
      },
      "slot3": {
        "name": "unknown",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/mew.png"
  },
  {
    "id": "chikorita",
    "dexNumber": 152,
    "name": "Chikorita",
    "specialty": "Bayas",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4400,
    "frequencyStr": "1h 13min 20s",
    "ingredientRate": 16.9,
    "skillRate": 3.9,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Miel",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/chikorita.png"
  },
  {
    "id": "bayleef",
    "dexNumber": 153,
    "name": "Bayleef",
    "specialty": "Bayas",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 16.8,
    "skillRate": 3.8,
    "carryLimit": 17,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Miel",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/bayleef.png"
  },
  {
    "id": "meganium",
    "dexNumber": 154,
    "name": "Meganium",
    "specialty": "Bayas",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 17.5,
    "skillRate": 4.6,
    "carryLimit": 20,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Miel",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/meganium.png"
  },
  {
    "id": "cyndaquil",
    "dexNumber": 155,
    "name": "Cyndaquil",
    "specialty": "Bayas",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 18.6,
    "skillRate": 2.1,
    "carryLimit": 14,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Jengibre",
      "Hierba Picante",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/cyndaquil.png"
  },
  {
    "id": "quilava",
    "dexNumber": 156,
    "name": "Quilava",
    "specialty": "Bayas",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 21.1,
    "skillRate": 4.1,
    "carryLimit": 18,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Jengibre",
      "Hierba Picante",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/quilava.png"
  },
  {
    "id": "typhlosion",
    "dexNumber": 157,
    "name": "Typhlosion",
    "specialty": "Bayas",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 20.8,
    "skillRate": 3.9,
    "carryLimit": 23,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Jengibre",
      "Hierba Picante",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/typhlosion.png"
  },
  {
    "id": "totodile",
    "dexNumber": 158,
    "name": "Totodile",
    "specialty": "Bayas",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 25.3,
    "skillRate": 5.2,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Aceite Puro",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/totodile.png"
  },
  {
    "id": "croconaw",
    "dexNumber": 159,
    "name": "Croconaw",
    "specialty": "Bayas",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 25.3,
    "skillRate": 5.2,
    "carryLimit": 15,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Aceite Puro",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/croconaw.png"
  },
  {
    "id": "feraligatr",
    "dexNumber": 160,
    "name": "Feraligatr",
    "specialty": "Bayas",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 25.7,
    "skillRate": 5.5,
    "carryLimit": 19,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Aceite Puro",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/feraligatr.png"
  },
  {
    "id": "pichu",
    "dexNumber": 172,
    "name": "Pichu",
    "specialty": "Bayas",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4300,
    "frequencyStr": "1h 11min 40s",
    "ingredientRate": 21,
    "skillRate": 2.3,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Manzana Selecta",
      "Jengibre",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/pichu.png"
  },
  {
    "id": "cleffa",
    "dexNumber": 173,
    "name": "Cleffa",
    "specialty": "Bayas",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Metrónomo",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 16.4,
    "skillRate": 3.4,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Manzana Selecta",
      "Miel",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/cleffa.png"
  },
  {
    "id": "igglybuff",
    "dexNumber": 174,
    "name": "Igglybuff",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 5200,
    "frequencyStr": "1h 26min 40s",
    "ingredientRate": 17,
    "skillRate": 3.8,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Miel",
      "Aceite Puro",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/igglybuff.png"
  },
  {
    "id": "togepi",
    "dexNumber": 175,
    "name": "Togepi",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Metrónomo",
    "baseFrequency": 4800,
    "frequencyStr": "1h 20min 0s",
    "ingredientRate": 15.1,
    "skillRate": 4.9,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Huevo Selecto",
      "Jengibre",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/togepi.png"
  },
  {
    "id": "togetic",
    "dexNumber": 176,
    "name": "Togetic",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Metrónomo",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 16.3,
    "skillRate": 5.6,
    "carryLimit": 10,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Jengibre",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/togetic.png"
  },
  {
    "id": "natu",
    "dexNumber": 177,
    "name": "Natu",
    "specialty": "Bayas",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 18.5,
    "skillRate": 1.6,
    "carryLimit": 11,
    "friendshipPoints": 12,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Cacao Relajante",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/natu.png"
  },
  {
    "id": "xatu",
    "dexNumber": 178,
    "name": "Xatu",
    "specialty": "Bayas",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 19.1,
    "skillRate": 2.5,
    "carryLimit": 19,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Cacao Relajante",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/xatu.png"
  },
  {
    "id": "mareep",
    "dexNumber": 179,
    "name": "Mareep",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 4600,
    "frequencyStr": "1h 16min 40s",
    "ingredientRate": 12.8,
    "skillRate": 4.7,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Hierba Picante",
      "Huevo Selecto",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/mareep.png"
  },
  {
    "id": "flaaffy",
    "dexNumber": 180,
    "name": "Flaaffy",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 12.7,
    "skillRate": 4.6,
    "carryLimit": 11,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Hierba Picante",
      "Huevo Selecto",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/flaaffy.png"
  },
  {
    "id": "ampharos",
    "dexNumber": 181,
    "name": "Ampharos",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 13,
    "skillRate": 4.7,
    "carryLimit": 15,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Hierba Picante",
      "Huevo Selecto",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/ampharos.png"
  },
  {
    "id": "sudowoodo",
    "dexNumber": 185,
    "name": "Sudowoodo",
    "specialty": "Habilidades",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 4000,
    "frequencyStr": "1h 6min 40s",
    "ingredientRate": 21.7,
    "skillRate": 7.2,
    "carryLimit": 16,
    "friendshipPoints": 7,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Soja Verdegal",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/sudowoodo.png"
  },
  {
    "id": "wooper",
    "dexNumber": 194,
    "name": "Wooper",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 5900,
    "frequencyStr": "1h 38min 20s",
    "ingredientRate": 20.1,
    "skillRate": 3.8,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Seta Sabrosa",
      "Patata",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 6,
        "c3": 10
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 12
      }
    },
    "avatarUrl": "/images/avatar/portrait/wooper.png"
  },
  {
    "id": "wooper-paldea",
    "dexNumber": 194,
    "name": "Wooper (Paldea)",
    "specialty": "Ingredientes",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 6400,
    "frequencyStr": "1h 46min 40s",
    "ingredientRate": 20.9,
    "skillRate": 5.6,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Café Estimulante",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Patata",
        "c3": 9
      }
    },
    "avatarUrl": "/images/avatar/portrait/wooperpaldea.png"
  },
  {
    "id": "quagsire",
    "dexNumber": 195,
    "name": "Quagsire",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 19,
    "skillRate": 3.2,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Seta Sabrosa",
      "Patata",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 6,
        "c3": 10
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 12
      }
    },
    "avatarUrl": "/images/avatar/portrait/quagsire.png"
  },
  {
    "id": "espeon",
    "dexNumber": 196,
    "name": "Espeon",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 16.4,
    "skillRate": 4.4,
    "carryLimit": 16,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/espeon.png"
  },
  {
    "id": "umbreon",
    "dexNumber": 197,
    "name": "Umbreon",
    "specialty": "Habilidades",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Charge Energy S (Moonlight)",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 21.9,
    "skillRate": 10.1,
    "carryLimit": 14,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/umbreon.png"
  },
  {
    "id": "murkrow",
    "dexNumber": 198,
    "name": "Murkrow",
    "specialty": "Habilidades",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Ingredient Draw S (Super Luck)",
    "baseFrequency": 3600,
    "frequencyStr": "1h 0min 0s",
    "ingredientRate": 14.1,
    "skillRate": 6.2,
    "carryLimit": 13,
    "friendshipPoints": 16,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Café Estimulante",
      "Soja Verdegal",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Café Estimulante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 3,
        "c3": 6
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/murkrow.png"
  },
  {
    "id": "slowking",
    "dexNumber": 199,
    "name": "Slowking",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 16.6,
    "skillRate": 8.7,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Cacao Relajante",
      "Cola de Slowpoke",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cola de Slowpoke",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/slowking.png"
  },
  {
    "id": "misdreavus",
    "dexNumber": 200,
    "name": "Misdreavus",
    "specialty": "Bayas",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "unknown",
    "baseFrequency": 0,
    "frequencyStr": "0 min 0s",
    "ingredientRate": 0,
    "skillRate": 0,
    "carryLimit": 0,
    "friendshipPoints": 16,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "unknown1",
      "unknown2",
      "unknown3"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "unknown1",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "unknown2",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "unknown3",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/misdreavus.png"
  },
  {
    "id": "wobbuffet",
    "dexNumber": 202,
    "name": "Wobbuffet",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 21.1,
    "skillRate": 8.2,
    "carryLimit": 16,
    "friendshipPoints": 7,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Seta Sabrosa",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/wobbuffet.png"
  },
  {
    "id": "steelix",
    "dexNumber": 208,
    "name": "Steelix",
    "specialty": "Bayas",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 15.4,
    "skillRate": 3.2,
    "carryLimit": 25,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Fiambre Vegetariano",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/steelix.png"
  },
  {
    "id": "shuckle",
    "dexNumber": 213,
    "name": "Shuckle",
    "specialty": "Habilidades",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Energy for Everyone S (Berry Juice)",
    "baseFrequency": 3600,
    "frequencyStr": "1h 0min 0s",
    "ingredientRate": 20.5,
    "skillRate": 5.9,
    "carryLimit": 16,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Aceite Puro",
      "Café Estimulante",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/shuckle.png"
  },
  {
    "id": "heracross",
    "dexNumber": 214,
    "name": "Heracross",
    "specialty": "Habilidades",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Cooking Assist S (Bulk Up)",
    "baseFrequency": 2300,
    "frequencyStr": "38 min 20s",
    "ingredientRate": 15.8,
    "skillRate": 4.7,
    "carryLimit": 20,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Miel",
      "Seta Sabrosa",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/heracross.png"
  },
  {
    "id": "sneasel",
    "dexNumber": 215,
    "name": "Sneasel",
    "specialty": "Bayas",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 25.5,
    "skillRate": 1.9,
    "carryLimit": 17,
    "friendshipPoints": 16,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Huevo Selecto",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/sneasel.png"
  },
  {
    "id": "delibird",
    "dexNumber": 225,
    "name": "Delibird",
    "specialty": "Ingredientes",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Ingredient Magnet S (Present)",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 18.8,
    "skillRate": 3,
    "carryLimit": 20,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Huevo Selecto",
      "Manzana Selecta",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/delibird.png"
  },
  {
    "id": "houndour",
    "dexNumber": 228,
    "name": "Houndour",
    "specialty": "Bayas",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 4900,
    "frequencyStr": "1h 21min 40s",
    "ingredientRate": 20.1,
    "skillRate": 3.7,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Jengibre",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/houndour.png"
  },
  {
    "id": "houndoom",
    "dexNumber": 229,
    "name": "Houndoom",
    "specialty": "Bayas",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 20.3,
    "skillRate": 4,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Hierba Picante",
      "Jengibre",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/houndoom.png"
  },
  {
    "id": "blissey",
    "dexNumber": 242,
    "name": "Blissey",
    "specialty": "Ingredientes",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 23.8,
    "skillRate": 2.3,
    "carryLimit": 21,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Patata",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Miel",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/blissey.png"
  },
  {
    "id": "raikou",
    "dexNumber": 243,
    "name": "Raikou",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Mejora de ayuda",
    "baseFrequency": 2100,
    "frequencyStr": "35 min 0s",
    "ingredientRate": 19.2,
    "skillRate": 1.9,
    "carryLimit": 22,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Hierba Picante",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/raikou.png"
  },
  {
    "id": "entei",
    "dexNumber": 244,
    "name": "Entei",
    "specialty": "Habilidades",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Mejora de ayuda",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 18.7,
    "skillRate": 2.3,
    "carryLimit": 19,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Aceite Puro",
      "Siestomate",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Siestomate",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/entei.png"
  },
  {
    "id": "suicune",
    "dexNumber": 245,
    "name": "Suicune",
    "specialty": "Habilidades",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Mejora de ayuda",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 27.7,
    "skillRate": 2.6,
    "carryLimit": 17,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Manzana Selecta",
      "Aceite Puro",
      "Maíz Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Maíz Verdegal",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/suicune.png"
  },
  {
    "id": "larvitar",
    "dexNumber": 246,
    "name": "Larvitar",
    "specialty": "Ingredientes",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4800,
    "frequencyStr": "1h 20min 0s",
    "ingredientRate": 23.8,
    "skillRate": 4.1,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Jengibre",
      "Soja Verdegal",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 5,
        "c3": 8
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/larvitar.png"
  },
  {
    "id": "pupitar",
    "dexNumber": 247,
    "name": "Pupitar",
    "specialty": "Ingredientes",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3600,
    "frequencyStr": "1h 0min 0s",
    "ingredientRate": 24.7,
    "skillRate": 4.5,
    "carryLimit": 13,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Jengibre",
      "Soja Verdegal",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 5,
        "c3": 8
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/pupitar.png"
  },
  {
    "id": "tyranitar",
    "dexNumber": 248,
    "name": "Tyranitar",
    "specialty": "Ingredientes",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 26.6,
    "skillRate": 5.2,
    "carryLimit": 19,
    "friendshipPoints": 25,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Jengibre",
      "Soja Verdegal",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 5,
        "c3": 8
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/tyranitar.png"
  },
  {
    "id": "treecko",
    "dexNumber": 252,
    "name": "Treecko",
    "specialty": "Habilidades",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Bayamanía",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 17.2,
    "skillRate": 3.5,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Huevo Selecto",
      "Café Estimulante",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/treecko.png"
  },
  {
    "id": "grovyle",
    "dexNumber": 253,
    "name": "Grovyle",
    "specialty": "Habilidades",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Bayamanía",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 15,
    "skillRate": 3.5,
    "carryLimit": 11,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Huevo Selecto",
      "Café Estimulante",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/grovyle.png"
  },
  {
    "id": "sceptile",
    "dexNumber": 254,
    "name": "Sceptile",
    "specialty": "Habilidades",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Bayamanía",
    "baseFrequency": 2300,
    "frequencyStr": "38 min 20s",
    "ingredientRate": 10.7,
    "skillRate": 3,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Huevo Selecto",
      "Café Estimulante",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/sceptile.png"
  },
  {
    "id": "torchic",
    "dexNumber": 255,
    "name": "Torchic",
    "specialty": "Bayas",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4300,
    "frequencyStr": "1h 11min 40s",
    "ingredientRate": 16,
    "skillRate": 4.4,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Seta Sabrosa",
      "Soja Verdegal",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/torchic.png"
  },
  {
    "id": "combusken",
    "dexNumber": 256,
    "name": "Combusken",
    "specialty": "Bayas",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 17,
    "skillRate": 5.2,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Seta Sabrosa",
      "Soja Verdegal",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/combusken.png"
  },
  {
    "id": "blaziken",
    "dexNumber": 257,
    "name": "Blaziken",
    "specialty": "Bayas",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 15.3,
    "skillRate": 4.9,
    "carryLimit": 22,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Seta Sabrosa",
      "Soja Verdegal",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/blaziken.png"
  },
  {
    "id": "mudkip",
    "dexNumber": 258,
    "name": "Mudkip",
    "specialty": "Bayas",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 4700,
    "frequencyStr": "1h 18min 20s",
    "ingredientRate": 19.2,
    "skillRate": 2.4,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Maíz Verdegal",
      "Leche Mu-mu",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/mudkip.png"
  },
  {
    "id": "marshtomp",
    "dexNumber": 259,
    "name": "Marshtomp",
    "specialty": "Bayas",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 16.8,
    "skillRate": 2.8,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Maíz Verdegal",
      "Leche Mu-mu",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/marshtomp.png"
  },
  {
    "id": "swampert",
    "dexNumber": 260,
    "name": "Swampert",
    "specialty": "Bayas",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 14.6,
    "skillRate": 3.4,
    "carryLimit": 20,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Maíz Verdegal",
      "Leche Mu-mu",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/swampert.png"
  },
  {
    "id": "ralts",
    "dexNumber": 280,
    "name": "Ralts",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 4800,
    "frequencyStr": "1h 20min 0s",
    "ingredientRate": 14.5,
    "skillRate": 4.3,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Maíz Verdegal",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/ralts.png"
  },
  {
    "id": "kirlia",
    "dexNumber": 281,
    "name": "Kirlia",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 14.6,
    "skillRate": 4.3,
    "carryLimit": 13,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Maíz Verdegal",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/kirlia.png"
  },
  {
    "id": "gardevoir",
    "dexNumber": 282,
    "name": "Gardevoir",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 14.4,
    "skillRate": 4.2,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Maíz Verdegal",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/gardevoir.png"
  },
  {
    "id": "slakoth",
    "dexNumber": 287,
    "name": "Slakoth",
    "specialty": "Bayas",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4900,
    "frequencyStr": "1h 21min 40s",
    "ingredientRate": 21.6,
    "skillRate": 1.9,
    "carryLimit": 7,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Miel",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/slakoth.png"
  },
  {
    "id": "vigoroth",
    "dexNumber": 288,
    "name": "Vigoroth",
    "specialty": "Bayas",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 20.4,
    "skillRate": 1.5,
    "carryLimit": 9,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Siestomate",
      "Miel",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/vigoroth.png"
  },
  {
    "id": "slaking",
    "dexNumber": 289,
    "name": "Slaking",
    "specialty": "Bayas",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3600,
    "frequencyStr": "1h 0min 0s",
    "ingredientRate": 33.9,
    "skillRate": 6.7,
    "carryLimit": 16,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Miel",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/slaking.png"
  },
  {
    "id": "sableye",
    "dexNumber": 302,
    "name": "Sableye",
    "specialty": "Habilidades",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 3600,
    "frequencyStr": "1h 0min 0s",
    "ingredientRate": 18.8,
    "skillRate": 6.8,
    "carryLimit": 16,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Aceite Puro",
      "Seta Sabrosa",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/sableye.png"
  },
  {
    "id": "mawile",
    "dexNumber": 303,
    "name": "Mawile",
    "specialty": "Ingredientes",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Ingredient Draw S (Hyper Cutter)",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 20.4,
    "skillRate": 3.8,
    "carryLimit": 17,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Maíz Verdegal",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/mawile.png"
  },
  {
    "id": "aron",
    "dexNumber": 304,
    "name": "Aron",
    "specialty": "Ingredientes",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 5700,
    "frequencyStr": "1h 35min 0s",
    "ingredientRate": 27.3,
    "skillRate": 4.6,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Café Estimulante",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/aron.png"
  },
  {
    "id": "lairon",
    "dexNumber": 305,
    "name": "Lairon",
    "specialty": "Ingredientes",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4200,
    "frequencyStr": "1h 10min 0s",
    "ingredientRate": 27.7,
    "skillRate": 4.8,
    "carryLimit": 13,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Café Estimulante",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/lairon.png"
  },
  {
    "id": "aggron",
    "dexNumber": 306,
    "name": "Aggron",
    "specialty": "Ingredientes",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 28.5,
    "skillRate": 5.2,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Café Estimulante",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/aggron.png"
  },
  {
    "id": "plusle",
    "dexNumber": 311,
    "name": "Plusle",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Ingredient Magnet S (Plus)",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 10.3,
    "skillRate": 4.9,
    "carryLimit": 16,
    "friendshipPoints": 10,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Café Estimulante",
      "Puerro Grueso",
      "Leche Mu-mu"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Café Estimulante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Leche Mu-mu",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/plusle.png"
  },
  {
    "id": "minun",
    "dexNumber": 312,
    "name": "Minun",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Cooking Power-Up S (Minus)",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 17.4,
    "skillRate": 4.9,
    "carryLimit": 16,
    "friendshipPoints": 10,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Miel",
      "Huevo Selecto",
      "Leche Mu-mu"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Leche Mu-mu",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/minun.png"
  },
  {
    "id": "gulpin",
    "dexNumber": 316,
    "name": "Gulpin",
    "specialty": "Habilidades",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 5900,
    "frequencyStr": "1h 38min 20s",
    "ingredientRate": 21.4,
    "skillRate": 6.3,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Soja Verdegal",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/gulpin.png"
  },
  {
    "id": "swalot",
    "dexNumber": 317,
    "name": "Swalot",
    "specialty": "Habilidades",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 21,
    "skillRate": 7,
    "carryLimit": 19,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Soja Verdegal",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/swalot.png"
  },
  {
    "id": "trapinch",
    "dexNumber": 328,
    "name": "Trapinch",
    "specialty": "Ingredientes",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5000,
    "frequencyStr": "1h 23min 20s",
    "ingredientRate": 15.2,
    "skillRate": 3.1,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "avocado",
      "Hierba Picante",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "avocado",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 12
      }
    },
    "avatarUrl": "/images/avatar/portrait/trapinch.png"
  },
  {
    "id": "vibrava",
    "dexNumber": 329,
    "name": "Vibrava",
    "specialty": "Ingredientes",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3700,
    "frequencyStr": "1h 1min 40s",
    "ingredientRate": 15.5,
    "skillRate": 3.4,
    "carryLimit": 12,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "avocado",
      "Hierba Picante",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "avocado",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 12
      }
    },
    "avatarUrl": "/images/avatar/portrait/vibrava.png"
  },
  {
    "id": "flygon",
    "dexNumber": 330,
    "name": "Flygon",
    "specialty": "Ingredientes",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 17.2,
    "skillRate": 3.9,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "avocado",
      "Hierba Picante",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "avocado",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 12
      }
    },
    "avatarUrl": "/images/avatar/portrait/flygon.png"
  },
  {
    "id": "swablu",
    "dexNumber": 333,
    "name": "Swablu",
    "specialty": "Bayas",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4200,
    "frequencyStr": "1h 10min 0s",
    "ingredientRate": 17.7,
    "skillRate": 3.2,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Huevo Selecto",
      "Soja Verdegal",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/swablu.png"
  },
  {
    "id": "altaria",
    "dexNumber": 334,
    "name": "Altaria",
    "specialty": "Bayas",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 25.8,
    "skillRate": 6.1,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Huevo Selecto",
      "Soja Verdegal",
      "Manzana Selecta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Manzana Selecta",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/altaria.png"
  },
  {
    "id": "shuppet",
    "dexNumber": 353,
    "name": "Shuppet",
    "specialty": "Bayas",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3900,
    "frequencyStr": "1h 5min 0s",
    "ingredientRate": 17.1,
    "skillRate": 2.6,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Aceite Puro",
      "Jengibre",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/shuppet.png"
  },
  {
    "id": "banette",
    "dexNumber": 354,
    "name": "Banette",
    "specialty": "Bayas",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 17.9,
    "skillRate": 3.3,
    "carryLimit": 19,
    "friendshipPoints": 16,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Aceite Puro",
      "Jengibre",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/banette.png"
  },
  {
    "id": "absol",
    "dexNumber": 359,
    "name": "Absol",
    "specialty": "Ingredientes",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2950,
    "frequencyStr": "49 min 10s",
    "ingredientRate": 17.8,
    "skillRate": 3.8,
    "carryLimit": 21,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Manzana Selecta",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 8,
        "c3": 12
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/absol.png"
  },
  {
    "id": "wynaut",
    "dexNumber": 360,
    "name": "Wynaut",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 5800,
    "frequencyStr": "1h 36min 40s",
    "ingredientRate": 21.3,
    "skillRate": 6.9,
    "carryLimit": 7,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Manzana Selecta",
      "Seta Sabrosa",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/wynaut.png"
  },
  {
    "id": "spheal",
    "dexNumber": 363,
    "name": "Spheal",
    "specialty": "Bayas",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 22.4,
    "skillRate": 2.3,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Fiambre Vegetariano",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/spheal.png"
  },
  {
    "id": "spheal-holiday",
    "dexNumber": 363,
    "name": "Spheal (Holiday)",
    "specialty": "Habilidades",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 21.4,
    "skillRate": 5,
    "carryLimit": 20,
    "friendshipPoints": 5,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Fiambre Vegetariano",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/sphealholiday.png"
  },
  {
    "id": "sealeo",
    "dexNumber": 364,
    "name": "Sealeo",
    "specialty": "Bayas",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 4000,
    "frequencyStr": "1h 6min 40s",
    "ingredientRate": 22.1,
    "skillRate": 2.1,
    "carryLimit": 13,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Fiambre Vegetariano",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/sealeo.png"
  },
  {
    "id": "walrein",
    "dexNumber": 365,
    "name": "Walrein",
    "specialty": "Bayas",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 22.3,
    "skillRate": 2.2,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Fiambre Vegetariano",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/walrein.png"
  },
  {
    "id": "bagon",
    "dexNumber": 371,
    "name": "Bagon",
    "specialty": "Bayas",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 5300,
    "frequencyStr": "1h 28min 20s",
    "ingredientRate": 20.9,
    "skillRate": 2.7,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Patata",
      "Jengibre",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/bagon.png"
  },
  {
    "id": "shelgon",
    "dexNumber": 372,
    "name": "Shelgon",
    "specialty": "Bayas",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 20.6,
    "skillRate": 2.7,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Patata",
      "Jengibre",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/shelgon.png"
  },
  {
    "id": "salamence",
    "dexNumber": 373,
    "name": "Salamence",
    "specialty": "Bayas",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 21.7,
    "skillRate": 3.4,
    "carryLimit": 22,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Patata",
      "Jengibre",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/salamence.png"
  },
  {
    "id": "latias",
    "dexNumber": 380,
    "name": "Latias",
    "specialty": "Habilidades",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Energizing Cheer S (Heal Pulse)",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 11.4,
    "skillRate": 4.9,
    "carryLimit": 19,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Siestomate",
      "Calabaza Suculenta",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Calabaza Suculenta",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/latias.png"
  },
  {
    "id": "latios",
    "dexNumber": 381,
    "name": "Latios",
    "specialty": "Habilidades",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Berry Burst (Draco Meteor)",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 19.8,
    "skillRate": 3,
    "carryLimit": 19,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Siestomate",
      "Huevo Selecto",
      "Leche Mu-mu"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Leche Mu-mu",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/latios.png"
  },
  {
    "id": "turtwig",
    "dexNumber": 387,
    "name": "Turtwig",
    "specialty": "Habilidades",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 13.2,
    "skillRate": 4.1,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Seta Sabrosa",
      "Patata",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/turtwig.png"
  },
  {
    "id": "grotle",
    "dexNumber": 388,
    "name": "Grotle",
    "specialty": "Habilidades",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 3700,
    "frequencyStr": "1h 1min 40s",
    "ingredientRate": 15,
    "skillRate": 4.6,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Seta Sabrosa",
      "Patata",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/grotle.png"
  },
  {
    "id": "torterra",
    "dexNumber": 389,
    "name": "Torterra",
    "specialty": "Habilidades",
    "type": "ground",
    "berry": "Baya Higog",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 2900,
    "frequencyStr": "48 min 20s",
    "ingredientRate": 15.6,
    "skillRate": 4.8,
    "carryLimit": 17,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Seta Sabrosa",
      "Patata",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/torterra.png"
  },
  {
    "id": "chimchar",
    "dexNumber": 390,
    "name": "Chimchar",
    "specialty": "Habilidades",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Bayamanía",
    "baseFrequency": 4100,
    "frequencyStr": "1h 8min 20s",
    "ingredientRate": 11.4,
    "skillRate": 3.3,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Hierba Picante",
      "Jengibre",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/chimchar.png"
  },
  {
    "id": "monferno",
    "dexNumber": 391,
    "name": "Monferno",
    "specialty": "Habilidades",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Bayamanía",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 11.4,
    "skillRate": 3.3,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Hierba Picante",
      "Jengibre",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/monferno.png"
  },
  {
    "id": "infernape",
    "dexNumber": 392,
    "name": "Infernape",
    "specialty": "Habilidades",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Bayamanía",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 10.6,
    "skillRate": 3.3,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Hierba Picante",
      "Jengibre",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/infernape.png"
  },
  {
    "id": "piplup",
    "dexNumber": 393,
    "name": "Piplup",
    "specialty": "Bayas",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Superútil S",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 15.9,
    "skillRate": 2.6,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Huevo Selecto",
      "Puerro Grueso",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/piplup.png"
  },
  {
    "id": "prinplup",
    "dexNumber": 394,
    "name": "Prinplup",
    "specialty": "Bayas",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Superútil S",
    "baseFrequency": 3700,
    "frequencyStr": "1h 1min 40s",
    "ingredientRate": 16.3,
    "skillRate": 3.5,
    "carryLimit": 15,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Huevo Selecto",
      "Puerro Grueso",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/prinplup.png"
  },
  {
    "id": "empoleon",
    "dexNumber": 395,
    "name": "Empoleon",
    "specialty": "Bayas",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Superútil S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 16.8,
    "skillRate": 3.8,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Huevo Selecto",
      "Puerro Grueso",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Miel",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/empoleon.png"
  },
  {
    "id": "shinx",
    "dexNumber": 403,
    "name": "Shinx",
    "specialty": "Ingredientes",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 4400,
    "frequencyStr": "1h 13min 20s",
    "ingredientRate": 18.1,
    "skillRate": 1.8,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Aceite Puro",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/shinx.png"
  },
  {
    "id": "luxio",
    "dexNumber": 404,
    "name": "Luxio",
    "specialty": "Ingredientes",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 18.2,
    "skillRate": 1.8,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Aceite Puro",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/luxio.png"
  },
  {
    "id": "luxray",
    "dexNumber": 405,
    "name": "Luxray",
    "specialty": "Ingredientes",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 20,
    "skillRate": 2.3,
    "carryLimit": 21,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Aceite Puro",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/luxray.png"
  },
  {
    "id": "drifloon",
    "dexNumber": 425,
    "name": "Drifloon",
    "specialty": "Habilidades",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Charge Strength S (Stockpile)",
    "baseFrequency": 4800,
    "frequencyStr": "1h 20min 0s",
    "ingredientRate": 13.7,
    "skillRate": 7.1,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Maíz Verdegal",
      "Aceite Puro",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Patata",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/drifloon.png"
  },
  {
    "id": "drifblim",
    "dexNumber": 426,
    "name": "Drifblim",
    "specialty": "Habilidades",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Charge Strength S (Stockpile)",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 12.8,
    "skillRate": 6.3,
    "carryLimit": 17,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Maíz Verdegal",
      "Aceite Puro",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Patata",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/drifblim.png"
  },
  {
    "id": "mismagius",
    "dexNumber": 429,
    "name": "Mismagius",
    "specialty": "Bayas",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Cooking Advance S (Mystical Fire)",
    "baseFrequency": 0,
    "frequencyStr": "0 min 0s",
    "ingredientRate": 0,
    "skillRate": 0,
    "carryLimit": 0,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "unknown1",
      "unknown2",
      "unknown3"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "unknown1",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "unknown2",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "unknown3",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/mismagius.png"
  },
  {
    "id": "honchkrow",
    "dexNumber": 430,
    "name": "Honchkrow",
    "specialty": "Habilidades",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Ingredient Draw S (Super Luck)",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 14.3,
    "skillRate": 6.7,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Café Estimulante",
      "Soja Verdegal",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Café Estimulante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 3,
        "c3": 6
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/honchkrow.png"
  },
  {
    "id": "bonsly",
    "dexNumber": 438,
    "name": "Bonsly",
    "specialty": "Habilidades",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 6300,
    "frequencyStr": "1h 45min 0s",
    "ingredientRate": 18.9,
    "skillRate": 6.1,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Soja Verdegal",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/bonsly.png"
  },
  {
    "id": "mime-jr",
    "dexNumber": 439,
    "name": "Mime Jr.",
    "specialty": "Ingredientes",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Skill Copy (Mimic)",
    "baseFrequency": 4300,
    "frequencyStr": "1h 11min 40s",
    "ingredientRate": 20.1,
    "skillRate": 3.2,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Patata",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/mimejr.png"
  },
  {
    "id": "happiny",
    "dexNumber": 440,
    "name": "Happiny",
    "specialty": "Ingredientes",
    "type": "normal",
    "berry": "Baya Caquic",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 5400,
    "frequencyStr": "1h 30min 0s",
    "ingredientRate": 21,
    "skillRate": 1.3,
    "carryLimit": 7,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Huevo Selecto",
      "Patata",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Miel",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/happiny.png"
  },
  {
    "id": "spiritomb",
    "dexNumber": 442,
    "name": "Spiritomb",
    "specialty": "Ingredientes",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Superútil S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 19.8,
    "skillRate": 3.6,
    "carryLimit": 27,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Seta Sabrosa",
      "Calabaza Suculenta",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Calabaza Suculenta",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/spiritomb.png"
  },
  {
    "id": "riolu",
    "dexNumber": 447,
    "name": "Riolu",
    "specialty": "Habilidades",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 4200,
    "frequencyStr": "1h 10min 0s",
    "ingredientRate": 12.6,
    "skillRate": 3.8,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Patata",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/riolu.png"
  },
  {
    "id": "lucario",
    "dexNumber": 448,
    "name": "Lucario",
    "specialty": "Habilidades",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Dream Shard Magnet S (Aura Sphere)",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 15,
    "skillRate": 5.1,
    "carryLimit": 14,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Patata",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/lucario.png"
  },
  {
    "id": "croagunk",
    "dexNumber": 453,
    "name": "Croagunk",
    "specialty": "Ingredientes",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 22.8,
    "skillRate": 4.2,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Aceite Puro",
      "Fiambre Vegetariano",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 5,
        "c3": 8
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/croagunk.png"
  },
  {
    "id": "toxicroak",
    "dexNumber": 454,
    "name": "Toxicroak",
    "specialty": "Ingredientes",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 22.9,
    "skillRate": 4.3,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Aceite Puro",
      "Fiambre Vegetariano",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 5,
        "c3": 8
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/toxicroak.png"
  },
  {
    "id": "snover",
    "dexNumber": 459,
    "name": "Snover",
    "specialty": "Ingredientes",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 25.1,
    "skillRate": 4.4,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Huevo Selecto",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/snover.png"
  },
  {
    "id": "abomasnow",
    "dexNumber": 460,
    "name": "Abomasnow",
    "specialty": "Ingredientes",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 25,
    "skillRate": 4.4,
    "carryLimit": 21,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Siestomate",
      "Huevo Selecto",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/abomasnow.png"
  },
  {
    "id": "weavile",
    "dexNumber": 461,
    "name": "Weavile",
    "specialty": "Bayas",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 25.1,
    "skillRate": 1.8,
    "carryLimit": 21,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "Huevo Selecto",
      "Soja Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Soja Verdegal",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/weavile.png"
  },
  {
    "id": "magnezone",
    "dexNumber": 462,
    "name": "Magnezone",
    "specialty": "Habilidades",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 17.9,
    "skillRate": 6.2,
    "carryLimit": 13,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Hierba Picante",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Hierba Picante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/magnezone.png"
  },
  {
    "id": "togekiss",
    "dexNumber": 468,
    "name": "Togekiss",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Metrónomo",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 15.8,
    "skillRate": 5.3,
    "carryLimit": 16,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Huevo Selecto",
      "Jengibre",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Huevo Selecto",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/togekiss.png"
  },
  {
    "id": "leafeon",
    "dexNumber": 470,
    "name": "Leafeon",
    "specialty": "Habilidades",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 3000,
    "frequencyStr": "50 min 0s",
    "ingredientRate": 20.5,
    "skillRate": 6.9,
    "carryLimit": 13,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/leafeon.png"
  },
  {
    "id": "glaceon",
    "dexNumber": 471,
    "name": "Glaceon",
    "specialty": "Habilidades",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 21.9,
    "skillRate": 6.3,
    "carryLimit": 12,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/glaceon.png"
  },
  {
    "id": "gallade",
    "dexNumber": 475,
    "name": "Gallade",
    "specialty": "Habilidades",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Superútil S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 14.7,
    "skillRate": 5.4,
    "carryLimit": 19,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Manzana Selecta",
      "Maíz Verdegal",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/gallade.png"
  },
  {
    "id": "cresselia",
    "dexNumber": 488,
    "name": "Cresselia",
    "specialty": "Habilidades",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Energy for Everyone S (Lunar Blessing)",
    "baseFrequency": 2300,
    "frequencyStr": "38 min 20s",
    "ingredientRate": 23.9,
    "skillRate": 4.1,
    "carryLimit": 22,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Jengibre",
      "Cacao Relajante",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Jengibre",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/cresselia.png"
  },
  {
    "id": "darkrai",
    "dexNumber": 491,
    "name": "Darkrai",
    "specialty": "Todo",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Mal Sueño",
    "baseFrequency": 2900,
    "frequencyStr": "48 min 20s",
    "ingredientRate": 19.2,
    "skillRate": 2.3,
    "carryLimit": 28,
    "friendshipPoints": 30,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Fiambre Vegetariano",
      "unknown",
      "unknown"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 2,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "unknown",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "unknown",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/darkrai.png"
  },
  {
    "id": "munna",
    "dexNumber": 517,
    "name": "Munna",
    "specialty": "Bayas",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 5700,
    "frequencyStr": "1h 35min 0s",
    "ingredientRate": 19.7,
    "skillRate": 4.3,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Miel",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/munna.png"
  },
  {
    "id": "musharna",
    "dexNumber": 518,
    "name": "Musharna",
    "specialty": "Bayas",
    "type": "psychic",
    "berry": "Baya Ango",
    "mainSkill": "Imán fragmentos S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 18.8,
    "skillRate": 4.1,
    "carryLimit": 24,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Miel",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Miel",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/musharna.png"
  },
  {
    "id": "dwebble",
    "dexNumber": 557,
    "name": "Dwebble",
    "specialty": "Habilidades",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 4300,
    "frequencyStr": "1h 11min 40s",
    "ingredientRate": 17.5,
    "skillRate": 5.4,
    "carryLimit": 8,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "avocado",
      "Patata",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "avocado",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/dwebble.png"
  },
  {
    "id": "crustle",
    "dexNumber": 558,
    "name": "Crustle",
    "specialty": "Habilidades",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 23.9,
    "skillRate": 6.4,
    "carryLimit": 17,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "avocado",
      "Patata",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "avocado",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Patata",
        "c2": 3,
        "c3": 5
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/crustle.png"
  },
  {
    "id": "foongus",
    "dexNumber": 590,
    "name": "Foongus",
    "specialty": "Ingredientes",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5700,
    "frequencyStr": "1h 35min 0s",
    "ingredientRate": 17.4,
    "skillRate": 3.5,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Seta Sabrosa",
      "Huevo Selecto",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 7,
        "c3": 10
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 11
      }
    },
    "avatarUrl": "/images/avatar/portrait/foongus.png"
  },
  {
    "id": "amoonguss",
    "dexNumber": 591,
    "name": "Amoonguss",
    "specialty": "Ingredientes",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 20.4,
    "skillRate": 4.7,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Seta Sabrosa",
      "Huevo Selecto",
      "Siestomate"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Seta Sabrosa",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Huevo Selecto",
        "c2": 7,
        "c3": 10
      },
      "slot3": {
        "name": "Siestomate",
        "c3": 11
      }
    },
    "avatarUrl": "/images/avatar/portrait/amoonguss.png"
  },
  {
    "id": "rufflet",
    "dexNumber": 627,
    "name": "Rufflet",
    "specialty": "Habilidades",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Bayamanía",
    "baseFrequency": 3800,
    "frequencyStr": "1h 3min 20s",
    "ingredientRate": 12.5,
    "skillRate": 3.1,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Maíz Verdegal",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/rufflet.png"
  },
  {
    "id": "braviary",
    "dexNumber": 628,
    "name": "Braviary",
    "specialty": "Habilidades",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Bayamanía",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 12.1,
    "skillRate": 3.5,
    "carryLimit": 18,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Maíz Verdegal",
      "Café Estimulante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Maíz Verdegal",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Café Estimulante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/braviary.png"
  },
  {
    "id": "tyrunt",
    "dexNumber": 696,
    "name": "Tyrunt",
    "specialty": "Bayas",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 5200,
    "frequencyStr": "1h 26min 40s",
    "ingredientRate": 20.3,
    "skillRate": 2.4,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Manzana Selecta",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/tyrunt.png"
  },
  {
    "id": "tyrantrum",
    "dexNumber": 697,
    "name": "Tyrantrum",
    "specialty": "Bayas",
    "type": "rock",
    "berry": "Baya Zidra",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 17.8,
    "skillRate": 2.9,
    "carryLimit": 23,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Fiambre Vegetariano",
      "Manzana Selecta",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Fiambre Vegetariano",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/tyrantrum.png"
  },
  {
    "id": "sylveon",
    "dexNumber": 700,
    "name": "Sylveon",
    "specialty": "Habilidades",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 17.8,
    "skillRate": 4,
    "carryLimit": 15,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Leche Mu-mu",
      "Cacao Relajante",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/sylveon.png"
  },
  {
    "id": "hawlucha",
    "dexNumber": 701,
    "name": "Hawlucha",
    "specialty": "Habilidades",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 19.2,
    "skillRate": 5.2,
    "carryLimit": 21,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Hierba Picante",
      "Jengibre",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Hierba Picante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/hawlucha.png"
  },
  {
    "id": "dedenne",
    "dexNumber": 702,
    "name": "Dedenne",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 17.7,
    "skillRate": 4.5,
    "carryLimit": 19,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Cacao Relajante",
      "Maíz Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Maíz Verdegal",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/dedenne.png"
  },
  {
    "id": "pumpkaboo-small",
    "dexNumber": 710,
    "name": "Pumpkaboo (Small)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5300,
    "frequencyStr": "1h 28min 20s",
    "ingredientRate": 12,
    "skillRate": 4.9,
    "carryLimit": 7,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/pumpkaboosmall.png"
  },
  {
    "id": "pumpkaboo-medium",
    "dexNumber": 710,
    "name": "Pumpkaboo (Medium)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5400,
    "frequencyStr": "1h 30min 0s",
    "ingredientRate": 12,
    "skillRate": 4.9,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/pumpkaboomedium.png"
  },
  {
    "id": "pumpkaboo-large",
    "dexNumber": 710,
    "name": "Pumpkaboo (Large)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5500,
    "frequencyStr": "1h 31min 40s",
    "ingredientRate": 12,
    "skillRate": 4.9,
    "carryLimit": 15,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/pumpkaboolarge.png"
  },
  {
    "id": "pumpkaboo-jumbo",
    "dexNumber": 710,
    "name": "Pumpkaboo (Jumbo)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 12,
    "skillRate": 4.9,
    "carryLimit": 21,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/pumpkaboojumbo.png"
  },
  {
    "id": "gourgeist-small",
    "dexNumber": 711,
    "name": "Gourgeist (Small)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 13,
    "skillRate": 4.9,
    "carryLimit": 10,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/gourgeistsmall.png"
  },
  {
    "id": "gourgeist-medium",
    "dexNumber": 711,
    "name": "Gourgeist (Medium)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3200,
    "frequencyStr": "53 min 20s",
    "ingredientRate": 13,
    "skillRate": 4.9,
    "carryLimit": 14,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/gourgeistmedium.png"
  },
  {
    "id": "gourgeist-large",
    "dexNumber": 711,
    "name": "Gourgeist (Large)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 13,
    "skillRate": 4.9,
    "carryLimit": 19,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/gourgeistlarge.png"
  },
  {
    "id": "gourgeist-jumbo",
    "dexNumber": 711,
    "name": "Gourgeist (Jumbo)",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3400,
    "frequencyStr": "56 min 40s",
    "ingredientRate": 13,
    "skillRate": 4.9,
    "carryLimit": 25,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Calabaza Suculenta",
      "Soja Verdegal",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Calabaza Suculenta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Soja Verdegal",
        "c2": 11,
        "c3": 18
      },
      "slot3": {
        "name": "Patata",
        "c3": 15
      }
    },
    "avatarUrl": "/images/avatar/portrait/gourgeistjumbo.png"
  },
  {
    "id": "noibat",
    "dexNumber": 714,
    "name": "Noibat",
    "specialty": "Habilidades",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 5100,
    "frequencyStr": "1h 25min 0s",
    "ingredientRate": 19.8,
    "skillRate": 4.8,
    "carryLimit": 7,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Manzana Selecta",
      "Puerro Grueso",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/noibat.png"
  },
  {
    "id": "noivern",
    "dexNumber": 715,
    "name": "Noivern",
    "specialty": "Habilidades",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 19.5,
    "skillRate": 4.8,
    "carryLimit": 18,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Manzana Selecta",
      "Puerro Grueso",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/noivern.png"
  },
  {
    "id": "grubbin",
    "dexNumber": 736,
    "name": "Grubbin",
    "specialty": "Ingredientes",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4600,
    "frequencyStr": "1h 16min 40s",
    "ingredientRate": 15.5,
    "skillRate": 2.9,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Café Estimulante",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Café Estimulante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Miel",
        "c3": 11
      }
    },
    "avatarUrl": "/images/avatar/portrait/grubbin.png"
  },
  {
    "id": "charjabug",
    "dexNumber": 737,
    "name": "Charjabug",
    "specialty": "Ingredientes",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 15.4,
    "skillRate": 2.8,
    "carryLimit": 15,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Café Estimulante",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Café Estimulante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Miel",
        "c3": 11
      }
    },
    "avatarUrl": "/images/avatar/portrait/charjabug.png"
  },
  {
    "id": "vikavolt",
    "dexNumber": 738,
    "name": "Vikavolt",
    "specialty": "Ingredientes",
    "type": "bug",
    "berry": "Baya Ziuela",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 19.4,
    "skillRate": 5.1,
    "carryLimit": 19,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Café Estimulante",
      "Seta Sabrosa",
      "Miel"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Café Estimulante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Seta Sabrosa",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Miel",
        "c3": 11
      }
    },
    "avatarUrl": "/images/avatar/portrait/vikavolt.png"
  },
  {
    "id": "cutiefly",
    "dexNumber": 742,
    "name": "Cutiefly",
    "specialty": "Ingredientes",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 19.9,
    "skillRate": 1.9,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snozing",
    "ingredients": [
      "Miel",
      "Aceite Puro",
      "Maíz Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Maíz Verdegal",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/cutiefly.png"
  },
  {
    "id": "ribombee",
    "dexNumber": 743,
    "name": "Ribombee",
    "specialty": "Ingredientes",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Ingredient Draw S",
    "baseFrequency": 2300,
    "frequencyStr": "38 min 20s",
    "ingredientRate": 19.4,
    "skillRate": 2.5,
    "carryLimit": 19,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snozing",
    "ingredients": [
      "Miel",
      "Aceite Puro",
      "Maíz Verdegal"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Miel",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Aceite Puro",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Maíz Verdegal",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/ribombee.png"
  },
  {
    "id": "stufful",
    "dexNumber": 759,
    "name": "Stufful",
    "specialty": "Ingredientes",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 4100,
    "frequencyStr": "1h 8min 20s",
    "ingredientRate": 22.5,
    "skillRate": 1.1,
    "carryLimit": 13,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Maíz Verdegal",
      "Fiambre Vegetariano",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 6,
        "c3": 10
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 9
      }
    },
    "avatarUrl": "/images/avatar/portrait/stufful.png"
  },
  {
    "id": "bewear",
    "dexNumber": 760,
    "name": "Bewear",
    "specialty": "Ingredientes",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Carga vigor S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 22.9,
    "skillRate": 1.3,
    "carryLimit": 20,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Maíz Verdegal",
      "Fiambre Vegetariano",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 6,
        "c3": 10
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 9
      }
    },
    "avatarUrl": "/images/avatar/portrait/bewear.png"
  },
  {
    "id": "comfey",
    "dexNumber": 764,
    "name": "Comfey",
    "specialty": "Ingredientes",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Ánimo enérgico S",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 16.7,
    "skillRate": 3.5,
    "carryLimit": 20,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Maíz Verdegal",
      "Jengibre",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Maíz Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Jengibre",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/comfey.png"
  },
  {
    "id": "togedemaru",
    "dexNumber": 777,
    "name": "Togedemaru",
    "specialty": "Habilidades",
    "type": "steel",
    "berry": "Baya Andano",
    "mainSkill": "Energizing Cheer S (Nuzzle)",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 16.9,
    "skillRate": 5.5,
    "carryLimit": 18,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "avocado",
      "Cacao Relajante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "avocado",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Cacao Relajante",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/togedemaru.png"
  },
  {
    "id": "mimikyu",
    "dexNumber": 778,
    "name": "Mimikyu",
    "specialty": "Habilidades",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Berry Burst (Disguise)",
    "baseFrequency": 2500,
    "frequencyStr": "41 min 40s",
    "ingredientRate": 15.3,
    "skillRate": 3.5,
    "carryLimit": 19,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Manzana Selecta",
      "Café Estimulante",
      "Seta Sabrosa"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 1,
        "c3": 2
      },
      "slot3": {
        "name": "Seta Sabrosa",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/mimikyu.png"
  },
  {
    "id": "drampa",
    "dexNumber": 780,
    "name": "Drampa",
    "specialty": "Ingredientes",
    "type": "dragon",
    "berry": "Baya Rimoya",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 29.4,
    "skillRate": 4.6,
    "carryLimit": 25,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Soja Verdegal",
      "avocado",
      "Fiambre Vegetariano"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "avocado",
        "c2": 3,
        "c3": 4
      },
      "slot3": {
        "name": "Fiambre Vegetariano",
        "c3": 7
      }
    },
    "avatarUrl": "/images/avatar/portrait/drampa.png"
  },
  {
    "id": "cramorant",
    "dexNumber": 845,
    "name": "Cramorant",
    "specialty": "Ingredientes",
    "type": "flying",
    "berry": "Baya Plama",
    "mainSkill": "Cocinitas S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 16.5,
    "skillRate": 3.9,
    "carryLimit": 19,
    "friendshipPoints": 16,
    "evolutionCount": -1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Aceite Puro",
      "Patata",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Aceite Puro",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Patata",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/cramorant.png"
  },
  {
    "id": "toxel",
    "dexNumber": 848,
    "name": "Toxel",
    "specialty": "Habilidades",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Imán ingredientes S",
    "baseFrequency": 5600,
    "frequencyStr": "1h 33min 20s",
    "ingredientRate": 20.9,
    "skillRate": 4.8,
    "carryLimit": 6,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Leche Mu-mu",
      "Manzana Selecta",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/toxel.png"
  },
  {
    "id": "toxtricity-amped",
    "dexNumber": 849,
    "name": "Toxtricity (Amped)",
    "specialty": "Habilidades",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Ingredient Magnet S (Plus)",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 23.9,
    "skillRate": 6.4,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Leche Mu-mu",
      "Manzana Selecta",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/toxtricityamped.png"
  },
  {
    "id": "toxtricity-low-key",
    "dexNumber": 849,
    "name": "Toxtricity (Low Key)",
    "specialty": "Habilidades",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Cooking Power-Up S (Minus)",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 23.9,
    "skillRate": 6.4,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Leche Mu-mu",
      "Manzana Selecta",
      "Puerro Grueso"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Leche Mu-mu",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Manzana Selecta",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Puerro Grueso",
        "c3": 2
      }
    },
    "avatarUrl": "/images/avatar/portrait/toxtricitylowkey.png"
  },
  {
    "id": "sprigatito",
    "dexNumber": 906,
    "name": "Sprigatito",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 4600,
    "frequencyStr": "1h 16min 40s",
    "ingredientRate": 20.8,
    "skillRate": 2.3,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Patata",
      "Leche Mu-mu",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/sprigatito.png"
  },
  {
    "id": "floragato",
    "dexNumber": 907,
    "name": "Floragato",
    "specialty": "Ingredientes",
    "type": "grass",
    "berry": "Baya Rudion",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 20.9,
    "skillRate": 2.3,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "dozing",
    "ingredients": [
      "Patata",
      "Leche Mu-mu",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/floragato.png"
  },
  {
    "id": "meowscarada",
    "dexNumber": 908,
    "name": "Meowscarada",
    "specialty": "Ingredientes",
    "type": "dark",
    "berry": "Baya Wiki",
    "mainSkill": "Cooking Power-Up S",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 19,
    "skillRate": 2.2,
    "carryLimit": 18,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Patata",
      "Leche Mu-mu",
      "Jengibre"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 6,
        "c3": 9
      },
      "slot3": {
        "name": "Jengibre",
        "c3": 8
      }
    },
    "avatarUrl": "/images/avatar/portrait/meowscarada.png"
  },
  {
    "id": "fuecoco",
    "dexNumber": 909,
    "name": "Fuecoco",
    "specialty": "Ingredientes",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 4200,
    "frequencyStr": "1h 10min 0s",
    "ingredientRate": 25.4,
    "skillRate": 5.3,
    "carryLimit": 11,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Fiambre Vegetariano",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/fuecoco.png"
  },
  {
    "id": "crocalor",
    "dexNumber": 910,
    "name": "Crocalor",
    "specialty": "Ingredientes",
    "type": "fire",
    "berry": "Baya Zanama",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3100,
    "frequencyStr": "51 min 40s",
    "ingredientRate": 24.7,
    "skillRate": 5,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Manzana Selecta",
      "Fiambre Vegetariano",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/crocalor.png"
  },
  {
    "id": "skeledirge",
    "dexNumber": 911,
    "name": "Skeledirge",
    "specialty": "Ingredientes",
    "type": "ghost",
    "berry": "Baya Oram",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2700,
    "frequencyStr": "45 min 0s",
    "ingredientRate": 26.8,
    "skillRate": 6.2,
    "carryLimit": 19,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Manzana Selecta",
      "Fiambre Vegetariano",
      "Hierba Picante"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Manzana Selecta",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 4,
        "c3": 6
      },
      "slot3": {
        "name": "Hierba Picante",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/skeledirge.png"
  },
  {
    "id": "quaxly",
    "dexNumber": 912,
    "name": "Quaxly",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 4800,
    "frequencyStr": "1h 20min 0s",
    "ingredientRate": 26.1,
    "skillRate": 2.8,
    "carryLimit": 10,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Puerro Grueso",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/quaxly.png"
  },
  {
    "id": "quaxwell",
    "dexNumber": 913,
    "name": "Quaxwell",
    "specialty": "Ingredientes",
    "type": "water",
    "berry": "Baya Aranja",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 3600,
    "frequencyStr": "1h 0min 0s",
    "ingredientRate": 25.9,
    "skillRate": 2.7,
    "carryLimit": 14,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Puerro Grueso",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/quaxwell.png"
  },
  {
    "id": "quaquaval",
    "dexNumber": 914,
    "name": "Quaquaval",
    "specialty": "Ingredientes",
    "type": "fighting",
    "berry": "Baya Zreza",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2600,
    "frequencyStr": "43 min 20s",
    "ingredientRate": 23.2,
    "skillRate": 2.4,
    "carryLimit": 19,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Soja Verdegal",
      "Puerro Grueso",
      "Aceite Puro"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Soja Verdegal",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Puerro Grueso",
        "c2": 2,
        "c3": 4
      },
      "slot3": {
        "name": "Aceite Puro",
        "c3": 6
      }
    },
    "avatarUrl": "/images/avatar/portrait/quaquaval.png"
  },
  {
    "id": "pawmi",
    "dexNumber": 921,
    "name": "Pawmi",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 4600,
    "frequencyStr": "1h 16min 40s",
    "ingredientRate": 11.1,
    "skillRate": 3.6,
    "carryLimit": 9,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Cacao Relajante",
      "Leche Mu-mu",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 3,
        "c3": 6
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/pawmi.png"
  },
  {
    "id": "pawmo",
    "dexNumber": 922,
    "name": "Pawmo",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 10.9,
    "skillRate": 3.6,
    "carryLimit": 12,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Cacao Relajante",
      "Leche Mu-mu",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 3,
        "c3": 6
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/pawmo.png"
  },
  {
    "id": "pawmot",
    "dexNumber": 923,
    "name": "Pawmot",
    "specialty": "Habilidades",
    "type": "electric",
    "berry": "Baya Uvav",
    "mainSkill": "Energy for Everyone S",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 14.1,
    "skillRate": 3.9,
    "carryLimit": 18,
    "friendshipPoints": 22,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Cacao Relajante",
      "Leche Mu-mu",
      "Huevo Selecto"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Leche Mu-mu",
        "c2": 3,
        "c3": 6
      },
      "slot3": {
        "name": "Huevo Selecto",
        "c3": 5
      }
    },
    "avatarUrl": "/images/avatar/portrait/pawmot.png"
  },
  {
    "id": "tinkatink",
    "dexNumber": 957,
    "name": "Tinkatink",
    "specialty": "Bayas",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 4500,
    "frequencyStr": "1h 15min 0s",
    "ingredientRate": 20.2,
    "skillRate": 1.6,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 2,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Cacao Relajante",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/tinkatink.png"
  },
  {
    "id": "tinkatuff",
    "dexNumber": 958,
    "name": "Tinkatuff",
    "specialty": "Bayas",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 3300,
    "frequencyStr": "55 min 0s",
    "ingredientRate": 18.6,
    "skillRate": 1.8,
    "carryLimit": 16,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Cacao Relajante",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/tinkatuff.png"
  },
  {
    "id": "tinkaton",
    "dexNumber": 959,
    "name": "Tinkaton",
    "specialty": "Bayas",
    "type": "fairy",
    "berry": "Baya Meloc",
    "mainSkill": "Carga vigor M",
    "baseFrequency": 2400,
    "frequencyStr": "40 min 0s",
    "ingredientRate": 18.5,
    "skillRate": 2,
    "carryLimit": 20,
    "friendshipPoints": 20,
    "evolutionCount": 2,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "snoozing",
    "ingredients": [
      "Siestomate",
      "Cacao Relajante",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Siestomate",
        "c1": 1,
        "c2": 2,
        "c3": 4
      },
      "slot2": {
        "name": "Cacao Relajante",
        "c2": 2,
        "c3": 3
      },
      "slot3": {
        "name": "Patata",
        "c3": 3
      }
    },
    "avatarUrl": "/images/avatar/portrait/tinkaton.png"
  },
  {
    "id": "cetoddle",
    "dexNumber": 974,
    "name": "Cetoddle",
    "specialty": "Ingredientes",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 5100,
    "frequencyStr": "1h 25min 0s",
    "ingredientRate": 22.3,
    "skillRate": 4.2,
    "carryLimit": 12,
    "friendshipPoints": 5,
    "evolutionCount": 0,
    "evolutionLeft": 1,
    "isFullyEvolved": false,
    "sleepType": "slumbering",
    "ingredients": [
      "Patata",
      "Fiambre Vegetariano",
      "Calabaza Suculenta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 5,
        "c3": 9
      },
      "slot3": {
        "name": "Calabaza Suculenta",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/cetoddle.png"
  },
  {
    "id": "cetitan",
    "dexNumber": 975,
    "name": "Cetitan",
    "specialty": "Ingredientes",
    "type": "ice",
    "berry": "Baya Safre",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 2800,
    "frequencyStr": "46 min 40s",
    "ingredientRate": 20.9,
    "skillRate": 4.2,
    "carryLimit": 25,
    "friendshipPoints": 20,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "slumbering",
    "ingredients": [
      "Patata",
      "Fiambre Vegetariano",
      "Calabaza Suculenta"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Patata",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Fiambre Vegetariano",
        "c2": 5,
        "c3": 9
      },
      "slot3": {
        "name": "Calabaza Suculenta",
        "c3": 4
      }
    },
    "avatarUrl": "/images/avatar/portrait/cetitan.png"
  },
  {
    "id": "clodsire",
    "dexNumber": 980,
    "name": "Clodsire",
    "specialty": "Ingredientes",
    "type": "poison",
    "berry": "Baya Atania",
    "mainSkill": "Charge Energy S",
    "baseFrequency": 3500,
    "frequencyStr": "58 min 20s",
    "ingredientRate": 20.8,
    "skillRate": 5.5,
    "carryLimit": 20,
    "friendshipPoints": 12,
    "evolutionCount": 1,
    "evolutionLeft": 0,
    "isFullyEvolved": true,
    "sleepType": "dozing",
    "ingredients": [
      "Cacao Relajante",
      "Café Estimulante",
      "Patata"
    ],
    "ingredientSlots": {
      "slot1": {
        "name": "Cacao Relajante",
        "c1": 2,
        "c2": 5,
        "c3": 7
      },
      "slot2": {
        "name": "Café Estimulante",
        "c2": 4,
        "c3": 7
      },
      "slot3": {
        "name": "Patata",
        "c3": 9
      }
    },
    "avatarUrl": "/images/avatar/portrait/clodsire.png"
  }
];

// Map for instant O(1) lookup by normalized name
const SPECIES_LOOKUP = new Map<string, MasterSpecies>();

for (const species of SPECIES_MASTER_DATA) {
  const normKey = species.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  SPECIES_LOOKUP.set(normKey, species);
  SPECIES_LOOKUP.set(species.id, species);
}

export function getSpeciesMasterData(query: string): MasterSpecies | undefined {
  if (!query) return undefined;
  const clean = query.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (SPECIES_LOOKUP.has(clean)) {
    return SPECIES_LOOKUP.get(clean);
  }
  for (const [key, entry] of SPECIES_LOOKUP.entries()) {
    if (clean.includes(key) || key.includes(clean)) {
      return entry;
    }
  }
  return undefined;
}
