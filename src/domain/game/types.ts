/**
 * Estado consolidado del juego.
 *
 * Agrupa todas las entidades de dominio en un único objeto serializable.
 * `lastSavedTimestamp` permite calcular el decrecimiento de necesidades
 * offline (cuánto tiempo pasó desde la última vez que el jugador guardó).
 */

import type { Pet } from '../pet';
import type { Wallet } from '../economy';
import type { Inventory } from '../inventory';
import type { Room } from '../room';

export interface GameState {
  readonly pet: Pet;
  readonly wallet: Wallet;
  readonly inventory: Inventory;
  readonly room: Room;
  readonly lastSavedTimestamp: number;
}
