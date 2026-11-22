/**
 * Lógica pura e inmutable para la gestión de la habitación, rejilla magnética (Grid Snap) y colocación de muebles.
 *
 * Responsabilidades:
 * - Validar y acotar coordenadas de muebles dentro de los límites espaciales de la habitación (R-01: SoC, R-03: Inmutabilidad).
 * - Proveer cálculo de rejilla magnética discreta (snapToGrid) para anclar físicamente los muebles al suelo o pared.
 * - Discriminar capas de colocación: muebles de suelo ('floor') vs decoraciones de pared ('wall', e.g. ventanas, cuadros).
 * - Prevenir que los muebles queden flotando en la pared o fuera del diorama.
 * - Coordinar el traspaso atómico de muebles entre el inventario del jugador y la habitación.
 */

import type { Inventory, InventoryItem } from '../inventory';
import type { Bounds, GridCell, PlacedItem, PlacementLayer, Room, RoomGrid } from './types';

/** Límites espaciales por defecto dentro del lienzo virtual 800x600 para la habitación completa. */
export const DEFAULT_ROOM_BOUNDS: Bounds = {
  minX: 60,
  maxX: 740,
  minY: 120,
  maxY: 540,
};

/** Límites espaciales válidos para muebles apoyados en el suelo (debajo del zócalo). */
export const DEFAULT_FLOOR_BOUNDS: Bounds = {
  minX: 60,
  maxX: 740,
  minY: 340,
  maxY: 540,
};

/** Límites espaciales válidos para decoraciones montadas en la pared (cuadros, ventanas, relojes). */
export const WALL_BOUNDS: Bounds = {
  minX: 60,
  maxX: 740,
  minY: 60,
  maxY: 290,
};

/**
 * Determina la capa de colocación adecuada para un ítem a partir de su identificador.
 *
 * Los ítems con prefijo 'wall-' o que representan ventanas, cuadros o relojes pertenecen a 'wall'.
 * El resto de muebles corresponden a 'floor' (apoyados en el suelo).
 */
export function getItemPlacementLayer(itemId: string): PlacementLayer {
  if (!itemId) {
    return 'floor';
  }
  const lower = itemId.toLowerCase();
  if (
    lower.startsWith('wall-') ||
    lower.includes('window') ||
    lower.includes('painting') ||
    lower.includes('poster') ||
    lower.includes('frame') ||
    lower.includes('clock') ||
    lower.includes('wallpaper')
  ) {
    return 'wall';
  }
  return 'floor';
}

/**
 * Obtiene los límites espaciales autorizados para una capa de colocación específica.
 */
export function getValidBoundsForLayer(layer: PlacementLayer): Bounds {
  return layer === 'wall' ? WALL_BOUNDS : DEFAULT_FLOOR_BOUNDS;
}

/**
 * Acota una posición (x, y) para garantizar que permanezca dentro de los límites especificados.
 *
 * @param position Coordenadas candidatas.
 * @param bounds Límites mínimos y máximos permitidos.
 * @returns Posición acotada de forma segura.
 */
export function clampToBounds(
  position: { x: number; y: number },
  bounds: Bounds
): { x: number; y: number } {
  const minX = Math.min(bounds.minX, bounds.maxX);
  const maxX = Math.max(bounds.minX, bounds.maxX);
  const minY = Math.min(bounds.minY, bounds.maxY);
  const maxY = Math.max(bounds.minY, bounds.maxY);

  const clampedX = Number.isNaN(position.x)
    ? minX
    : Math.max(minX, Math.min(maxX, position.x));

  const clampedY = Number.isNaN(position.y)
    ? minY
    : Math.max(minY, Math.min(maxY, position.y));

  return { x: clampedX, y: clampedY };
}

/**
 * Comprueba si una posición se encuentra estrictamente dentro de los límites dados.
 *
 * @param position Coordenadas a verificar.
 * @param bounds Límites válidos.
 */
export function isWithinBounds(
  position: { x: number; y: number },
  bounds: Bounds
): boolean {
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return false;
  }
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.y >= bounds.minY &&
    position.y <= bounds.maxY
  );
}

/**
 * Comprueba si una posición es válida para la capa de colocación especificada (suelo o pared).
 */
export function isValidPlacementPosition(
  position: { x: number; y: number },
  layer: PlacementLayer = 'floor'
): boolean {
  return isWithinBounds(position, getValidBoundsForLayer(layer));
}

/**
 * Valida si un ítem puede colocarse en una posición dada según su categoría espacial.
 * Los muebles de suelo NUNCA se permiten en la pared, y las decoraciones de pared no van al suelo.
 */
export function canPlaceItemAt(
  itemId: string,
  position: { x: number; y: number }
): boolean {
  const layer = getItemPlacementLayer(itemId);
  return isValidPlacementPosition(position, layer);
}

export interface RoomGridConfig {
  readonly cols?: number;
  readonly rows?: number;
  readonly cellWidth?: number;
  readonly cellHeight?: number;
  readonly originX?: number;
  readonly originY?: number;
  readonly layer?: PlacementLayer;
}

/**
 * Genera una rejilla discreta inmutable de celdas centradas para la habitación.
 */
export function createRoomGrid(config?: RoomGridConfig): RoomGrid {
  const cols = config?.cols ?? 8;
  const rows = config?.rows ?? 4;
  const cellWidth = config?.cellWidth ?? 80;
  const cellHeight = config?.cellHeight ?? 50;
  const originX = config?.originX ?? 80;
  const originY = config?.originY ?? 340;
  const layer = config?.layer ?? 'floor';

  const cells: GridCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        col: c,
        row: r,
        x: Math.round(originX + c * cellWidth + cellWidth / 2),
        y: Math.round(originY + r * cellHeight + cellHeight / 2),
        layer,
      });
    }
  }

  return {
    cols,
    rows,
    cellWidth,
    cellHeight,
    originX,
    originY,
    cells,
    layer,
  };
}

/** Rejilla de suelo por defecto: 8 columnas x 4 filas discretas sobre el parquet (340 a 540 Y). */
export const DEFAULT_FLOOR_GRID: RoomGrid = createRoomGrid();

/** Rejilla de pared por defecto: 6 columnas x 2 filas discretas para cuadros y ventanas (60 a 240 Y). */
export const DEFAULT_WALL_GRID: RoomGrid = createRoomGrid({
  cols: 6,
  rows: 2,
  cellWidth: 100,
  cellHeight: 90,
  originX: 100,
  originY: 70,
  layer: 'wall',
});

/**
 * Función pura que calcula el snap magnético de una posición a la celda discreta más cercana de la rejilla.
 *
 * @param position Coordenadas deseadas (x, y).
 * @param grid Configuración de la rejilla (por defecto DEFAULT_FLOOR_GRID).
 * @returns Coordenadas centradas de la celda más próxima.
 */
export function snapToGrid(
  position: { x: number; y: number },
  grid: RoomGrid = DEFAULT_FLOOR_GRID
): { x: number; y: number } {
  if (
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.y) ||
    grid.cells.length === 0
  ) {
    return {
      x: Number.isFinite(position.x) ? position.x : 0,
      y: Number.isFinite(position.y) ? position.y : 0,
    };
  }

  let minDistanceSq = Infinity;
  let nearestCell = grid.cells[0];

  for (const cell of grid.cells) {
    const dx = cell.x - position.x;
    const dy = cell.y - position.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearestCell = cell;
    }
  }

  return { x: nearestCell.x, y: nearestCell.y };
}

/**
 * Encuentra y retorna la celda discreta más cercana a las coordenadas dadas.
 */
export function findNearestGridCell(
  position: { x: number; y: number },
  grid: RoomGrid = DEFAULT_FLOOR_GRID
): GridCell | null {
  if (
    !Number.isFinite(position.x) ||
    !Number.isFinite(position.y) ||
    grid.cells.length === 0
  ) {
    return null;
  }

  let minDistanceSq = Infinity;
  let nearestCell = grid.cells[0];

  for (const cell of grid.cells) {
    const dx = cell.x - position.x;
    const dy = cell.y - position.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      nearestCell = cell;
    }
  }

  return nearestCell;
}

/**
 * Coloca un ítem o mueble en la habitación asegurando que sus coordenadas estén dentro
 * de los límites válidos. Si el ítem ya existía en la habitación, actualiza su posición.
 *
 * @param room Estado actual inmutable de la habitación.
 * @param item Mueble a colocar con sus coordenadas deseadas y capa opcional.
 * @param validBounds Límites permitidos para la colocación.
 * @returns Nueva instancia inmutable de Room con el ítem colocado.
 */
export function placeItemInRoom(
  room: Room,
  item: PlacedItem,
  validBounds: Bounds = DEFAULT_ROOM_BOUNDS
): Room {
  if (!item.itemId || item.itemId.trim() === '') {
    return room;
  }

  const layer = item.layer ?? getItemPlacementLayer(item.itemId);
  const clamped = clampToBounds({ x: item.x, y: item.y }, validBounds);
  const validatedItem: PlacedItem = {
    itemId: item.itemId,
    x: clamped.x,
    y: clamped.y,
    layer,
  };

  const existingIndex = room.placedItems.findIndex((i) => i.itemId === item.itemId);

  if (existingIndex >= 0) {
    const updatedPlacedItems = room.placedItems.map((placed, idx) =>
      idx === existingIndex ? validatedItem : placed
    );
    return {
      ...room,
      placedItems: updatedPlacedItems,
    };
  }

  return {
    ...room,
    placedItems: [...room.placedItems, validatedItem],
  };
}

/**
 * Mueve un ítem existente dentro de la habitación a una nueva posición acotada.
 * Si el ítem no existe en la habitación, retorna la habitación original sin mutaciones.
 *
 * @param room Estado actual inmutable de la habitación.
 * @param itemId Identificador único del mueble a mover.
 * @param newPosition Nuevas coordenadas deseadas.
 * @param validBounds Límites permitidos para el movimiento.
 * @returns Nueva instancia inmutable de Room con la posición actualizada.
 */
export function moveItemInRoom(
  room: Room,
  itemId: string,
  newPosition: { x: number; y: number },
  validBounds: Bounds = DEFAULT_ROOM_BOUNDS
): Room {
  const existingItem = room.placedItems.find((i) => i.itemId === itemId);
  if (!existingItem) {
    return room;
  }

  const clamped = clampToBounds(newPosition, validBounds);
  if (existingItem.x === clamped.x && existingItem.y === clamped.y) {
    return room;
  }

  const updatedPlacedItems = room.placedItems.map((item) =>
    item.itemId === itemId ? { ...item, x: clamped.x, y: clamped.y } : item
  );

  return {
    ...room,
    placedItems: updatedPlacedItems,
  };
}

/**
 * Retira un ítem de la habitación de forma pura e inmutable.
 * Si el ítem no se encontraba colocado, retorna la habitación sin cambios.
 *
 * @param room Estado actual inmutable de la habitación.
 * @param itemId Identificador del mueble a retirar.
 * @returns Nueva instancia inmutable de Room sin el ítem.
 */
export function removeItemFromRoom(room: Room, itemId: string): Room {
  const exists = room.placedItems.some((i) => i.itemId === itemId);
  if (!exists) {
    return room;
  }

  return {
    ...room,
    placedItems: room.placedItems.filter((i) => i.itemId !== itemId),
  };
}

/**
 * Transfiere un mueble desde el inventario del jugador hacia la habitación (Colocar mueble).
 * Descuenta 1 unidad del inventario y lo posiciona en la sala.
 *
 * @param room Habitación actual.
 * @param inventory Inventario actual.
 * @param itemId Identificador del ítem en el inventario.
 * @param position Coordenadas donde se desea colocar.
 * @param bounds Límites válidos para el posicionamiento.
 */
export function placeFurnitureFromInventory(
  room: Room,
  inventory: Inventory,
  itemId: string,
  position: { x: number; y: number },
  bounds: Bounds = DEFAULT_ROOM_BOUNDS
): { room: Room; inventory: Inventory; success: boolean } {
  const itemIndex = inventory.items.findIndex(
    (item) => item.id === itemId && item.quantity > 0
  );

  if (itemIndex === -1) {
    return { room, inventory, success: false };
  }

  const sourceItem = inventory.items[itemIndex];
  const newQuantity = sourceItem.quantity - 1;

  const updatedInventoryItems =
    newQuantity > 0
      ? inventory.items.map((item, idx) =>
          idx === itemIndex ? { ...item, quantity: newQuantity } : item
        )
      : inventory.items.filter((_, idx) => idx !== itemIndex);

  const updatedRoom = placeItemInRoom(
    room,
    { itemId, x: position.x, y: position.y },
    bounds
  );

  return {
    room: updatedRoom,
    inventory: {
      items: updatedInventoryItems,
    },
    success: true,
  };
}

/**
 * Retira un mueble de la habitación y lo devuelve al baúl/inventario del jugador.
 *
 * @param room Habitación actual.
 * @param inventory Inventario actual.
 * @param itemId Identificador del mueble colocado a retirar.
 * @param itemMetadata Metadatos opcionales por si el ítem ya no figuraba en el inventario.
 */
export function returnFurnitureToInventory(
  room: Room,
  inventory: Inventory,
  itemId: string,
  itemMetadata?: { name?: string; category?: 'furniture' }
): { room: Room; inventory: Inventory; success: boolean } {
  const isPlaced = room.placedItems.some((i) => i.itemId === itemId);
  if (!isPlaced) {
    return { room, inventory, success: false };
  }

  const updatedRoom = removeItemFromRoom(room, itemId);

  const existingIndex = inventory.items.findIndex((item) => item.id === itemId);
  let updatedInventoryItems: readonly InventoryItem[];

  if (existingIndex >= 0) {
    updatedInventoryItems = inventory.items.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
    );
  } else {
    const newItem: InventoryItem = {
      id: itemId,
      name: itemMetadata?.name ?? itemId,
      category: itemMetadata?.category ?? 'furniture',
      quantity: 1,
    };
    updatedInventoryItems = [...inventory.items, newItem];
  }

  return {
    room: updatedRoom,
    inventory: {
      items: updatedInventoryItems,
    },
    success: true,
  };
}
