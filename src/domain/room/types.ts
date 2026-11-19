/**
 * Modelos de dominio inmutables para la habitación de la mascota.
 */

/** Un mueble/ítem colocado en la habitación con su posición. */
export interface PlacedItem {
  readonly itemId: string;
  readonly x: number;
  readonly y: number;
}

/** La habitación del jugador con sus ítems colocados. */
export interface Room {
  readonly id: string;
  readonly name: string;
  readonly placedItems: readonly PlacedItem[];
}
