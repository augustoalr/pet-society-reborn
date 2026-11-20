/**
 * Modelos de dominio inmutables para la habitación de la mascota.
 */

/** Límites espaciales 2D válidos para colocar o mover muebles dentro de la habitación. */
export interface Bounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

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
