/**
 * Lógica pura e inmutable para la gestión de la habitación y colocación de muebles.
 *
 * Responsabilidades:
 * - Validar y acotar coordenadas de muebles dentro de los límites espaciales de la habitación (R-01: SoC, R-03: Inmutabilidad).
 * - Colocar muebles en la habitación asegurando que no se dupliquen y respeten los límites válidos.
 * - Mover muebles existentes con acotamiento de límites (clamping).
 * - Retirar muebles de la sala de forma pura.
 * - Coordinar el traspaso atómico de muebles entre el inventario del jugador y la habitación.
 */

import type { Inventory, InventoryItem } from '../inventory';
import type { Bounds, PlacedItem, Room } from './types';

/** Límites espaciales por defecto dentro del lienzo virtual 800x600 para la habitación. */
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
 * Comprueba si una posición se encuentra estrictamente dentro de los límites.
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
 * Coloca un ítem o mueble en la habitación asegurando que sus coordenadas estén dentro
 * de los límites válidos. Si el ítem ya existía en la habitación, actualiza su posición.
 *
 * @param room Estado actual inmutable de la habitación.
 * @param item Mueble a colocar con sus coordenadas deseadas.
 * @param validBounds Límites permitidos para la colocación.
 * @returns Nueva instancia inmutable de Room con el ítem colocado.
 */
export function placeItemInRoom(
  room: Room,
  item: PlacedItem,
  validBounds: Bounds = DEFAULT_ROOM_BOUNDS
): Room {
  // Early return si el itemId es inválido
  if (!item.itemId || item.itemId.trim() === '') {
    return room;
  }

  const clamped = clampToBounds({ x: item.x, y: item.y }, validBounds);
  const validatedItem: PlacedItem = {
    itemId: item.itemId,
    x: clamped.x,
    y: clamped.y,
  };

  const existingIndex = room.placedItems.findIndex((i) => i.itemId === item.itemId);

  if (existingIndex >= 0) {
    // Si ya existe, actualiza la posición del ítem existente
    const updatedPlacedItems = room.placedItems.map((placed, idx) =>
      idx === existingIndex ? validatedItem : placed
    );
    return {
      ...room,
      placedItems: updatedPlacedItems,
    };
  }

  // Si no existe, agrega el nuevo ítem a la lista de forma inmutable
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

  // Actualizar inventario inmutablemente
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
