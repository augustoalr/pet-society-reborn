/**
 * Fábrica del estado por defecto para nuevos jugadores.
 *
 * Retorna un GameState válido, completo e inmutable que representa
 * el punto de partida de cualquier partida nueva.
 */

import type { GameState } from './types';

export function createDefaultGameState(): GameState {
  return {
    pet: {
      id: 'default-pet',
      name: 'Mi Mascota',
      appearance: {
        color: 'white',
        eyes: 'round',
        mouth: 'smile',
        ears: 'floppy',
      },
      clothes: {
        hat: null,
        shirt: null,
        accessory: null,
      },
      needs: {
        hunger: 80,
        hygiene: 80,
        energy: 100,
        happiness: 100,
      },
      level: 1,
    },
    wallet: {
      coins: 100,
      cash: 0,
    },
    inventory: {
      items: [
        {
          id: 'food-apple',
          name: 'Manzana fresca',
          category: 'food',
          quantity: 3,
          nutrition: 20,
        },
        {
          id: 'food-bread',
          name: 'Panecillo tierno',
          category: 'food',
          quantity: 2,
          nutrition: 35,
        },
      ],
    },
    room: {
      id: 'default-room',
      name: 'Mi Habitación',
      placedItems: [],
    },
    lastSavedTimestamp: Date.now(),
  };
}
