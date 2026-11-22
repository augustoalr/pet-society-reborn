/**
 * Modelos de dominio inmutables para la habitación de la mascota, rejilla 2.5D y colocación de muebles.
 */

/** Categoría de colocación espacial: muebles apoyados en el suelo vs decoraciones de pared. */
export type PlacementLayer = 'floor' | 'wall';

/** Límites espaciales 2D válidos para colocar o mover muebles dentro de la habitación. */
export interface Bounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/** Celda discreta de la rejilla magnética para la colocación de muebles en la sala. */
export interface GridCell {
  readonly col: number;
  readonly row: number;
  readonly x: number;
  readonly y: number;
  readonly layer: PlacementLayer;
}

/** Configuración y conjunto inmutable de celdas que componen una rejilla de habitación. */
export interface RoomGrid {
  readonly cols: number;
  readonly rows: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly originX: number;
  readonly originY: number;
  readonly cells: readonly GridCell[];
  readonly layer: PlacementLayer;
}

/** Un mueble/ítem colocado en la habitación con su posición y capa espacial opcional. */
export interface PlacedItem {
  readonly itemId: string;
  readonly x: number;
  readonly y: number;
  readonly layer?: PlacementLayer;
}

/** La habitación del jugador con sus ítems colocados. */
export interface Room {
  readonly id: string;
  readonly name: string;
  readonly placedItems: readonly PlacedItem[];
}
