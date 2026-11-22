/**
 * Tipos e interfaces para el subsistema de renderizado de la habitación y muebles en PixiJS.
 */

import type { PlacementLayer } from '../../domain';

/** Dimensiones y configuración de las áreas de la habitación virtual. */
export interface RoomLayoutConfig {
  readonly width: number;
  readonly height: number;
  readonly wallHeight: number;
  readonly baseboardHeight: number;
  readonly floorHeight: number;
}

/** Definición y metadatos de un mueble procedimental en el catálogo. */
export interface FurnitureDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'furniture';
  readonly placementLayer?: PlacementLayer;
  readonly width: number;
  readonly height: number;
  /** Coordenadas sugeridas por defecto para colocar el mueble en la habitación. */
  readonly defaultPosition: {
    readonly x: number;
    readonly y: number;
  };
}

/** Evento emitido al mover un mueble en el escenario virtual. */
export interface FurnitureMovedEvent {
  readonly itemId: string;
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
}
