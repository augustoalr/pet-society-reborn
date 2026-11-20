import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ROOM_BOUNDS,
  DEFAULT_FLOOR_BOUNDS,
  clampToBounds,
  isWithinBounds,
  placeItemInRoom,
  moveItemInRoom,
  removeItemFromRoom,
  placeFurnitureFromInventory,
  returnFurnitureToInventory,
} from '../roomLogic';
import type { Bounds, PlacedItem, Room } from '../types';
import type { Inventory, InventoryItem } from '../../inventory';

describe('roomLogic (Dominio de Habitación y Muebles)', () => {
  const customBounds: Bounds = {
    minX: 100,
    maxX: 700,
    minY: 200,
    maxY: 500,
  };

  const sampleRoom: Room = Object.freeze({
    id: 'room-1',
    name: 'Habitación de Prueba',
    placedItems: Object.freeze([
      { itemId: 'furniture-bed', x: 200, y: 350 },
      { itemId: 'furniture-lamp', x: 150, y: 300 },
    ]),
  });

  const sampleInventory: Inventory = Object.freeze({
    items: Object.freeze<InventoryItem[]>([
      {
        id: 'furniture-table',
        name: 'Mesa de Madera',
        category: 'furniture',
        quantity: 2,
      },
      {
        id: 'furniture-plant',
        name: 'Planta de Interior',
        category: 'furniture',
        quantity: 1,
      },
      {
        id: 'food-apple',
        name: 'Manzana fresca',
        category: 'food',
        quantity: 3,
      },
    ]),
  });

  // ─── clampToBounds & isWithinBounds ─────────────────────────

  describe('clampToBounds', () => {
    it('retorna la posición sin cambios si ya está dentro de los límites', () => {
      const pos = { x: 300, y: 350 };
      expect(clampToBounds(pos, customBounds)).toEqual({ x: 300, y: 350 });
    });

    it('acota X cuando es menor que minX o mayor que maxX', () => {
      expect(clampToBounds({ x: 50, y: 300 }, customBounds)).toEqual({ x: 100, y: 300 });
      expect(clampToBounds({ x: 800, y: 300 }, customBounds)).toEqual({ x: 700, y: 300 });
    });

    it('acota Y cuando es menor que minY o mayor que maxY', () => {
      expect(clampToBounds({ x: 300, y: 100 }, customBounds)).toEqual({ x: 300, y: 200 });
      expect(clampToBounds({ x: 300, y: 650 }, customBounds)).toEqual({ x: 300, y: 500 });
    });

    it('maneja valores no finitos (NaN o Infinity) con seguridad', () => {
      const clamped = clampToBounds({ x: NaN, y: Infinity }, customBounds);
      expect(clamped.x).toBe(customBounds.minX);
      expect(clamped.y).toBe(customBounds.maxY);
    });
  });

  describe('isWithinBounds', () => {
    it('retorna true para coordenadas interiores y en los bordes exactos', () => {
      expect(isWithinBounds({ x: 300, y: 300 }, customBounds)).toBe(true);
      expect(isWithinBounds({ x: 100, y: 200 }, customBounds)).toBe(true);
      expect(isWithinBounds({ x: 700, y: 500 }, customBounds)).toBe(true);
    });

    it('retorna false para coordenadas fuera de los límites o NaN', () => {
      expect(isWithinBounds({ x: 99, y: 300 }, customBounds)).toBe(false);
      expect(isWithinBounds({ x: 701, y: 300 }, customBounds)).toBe(false);
      expect(isWithinBounds({ x: 300, y: 199 }, customBounds)).toBe(false);
      expect(isWithinBounds({ x: 300, y: 501 }, customBounds)).toBe(false);
      expect(isWithinBounds({ x: NaN, y: 300 }, customBounds)).toBe(false);
    });
  });

  // ─── placeItemInRoom ────────────────────────────────────────

  describe('placeItemInRoom', () => {
    it('agrega un nuevo mueble a la habitación respetando los límites válidos', () => {
      const newItem: PlacedItem = { itemId: 'furniture-table', x: 450, y: 400 };
      const nextRoom = placeItemInRoom(sampleRoom, newItem, customBounds);

      expect(nextRoom.placedItems.length).toBe(3);
      expect(nextRoom.placedItems[2]).toEqual({ itemId: 'furniture-table', x: 450, y: 400 });
      expect(nextRoom).not.toBe(sampleRoom);
    });

    it('acota automáticamente las coordenadas si exceden los límites especificados', () => {
      const outOfBoundsItem: PlacedItem = { itemId: 'furniture-table', x: 999, y: 999 };
      const nextRoom = placeItemInRoom(sampleRoom, outOfBoundsItem, customBounds);

      expect(nextRoom.placedItems[2]).toEqual({
        itemId: 'furniture-table',
        x: customBounds.maxX,
        y: customBounds.maxY,
      });
    });

    it('actualiza la posición si el ítem ya existía en la habitación sin duplicarlo', () => {
      const updatedBed: PlacedItem = { itemId: 'furniture-bed', x: 500, y: 450 };
      const nextRoom = placeItemInRoom(sampleRoom, updatedBed, customBounds);

      expect(nextRoom.placedItems.length).toBe(2);
      expect(nextRoom.placedItems[0]).toEqual({ itemId: 'furniture-bed', x: 500, y: 450 });
    });

    it('retorna la habitación original si el itemId está vacío o es inválido', () => {
      const invalidItem: PlacedItem = { itemId: '  ', x: 300, y: 300 };
      const nextRoom = placeItemInRoom(sampleRoom, invalidItem, customBounds);

      expect(nextRoom).toBe(sampleRoom);
      expect(nextRoom.placedItems.length).toBe(2);
    });

    it('utiliza DEFAULT_ROOM_BOUNDS cuando no se especifican límites', () => {
      const item: PlacedItem = { itemId: 'furniture-plant', x: 10, y: 10 };
      const nextRoom = placeItemInRoom(sampleRoom, item);

      expect(nextRoom.placedItems[2].x).toBe(DEFAULT_ROOM_BOUNDS.minX);
      expect(nextRoom.placedItems[2].y).toBe(DEFAULT_ROOM_BOUNDS.minY);
    });
  });

  // ─── moveItemInRoom ─────────────────────────────────────────

  describe('moveItemInRoom', () => {
    it('mueve un ítem existente a la nueva posición acotada', () => {
      const nextRoom = moveItemInRoom(sampleRoom, 'furniture-bed', { x: 350, y: 400 }, customBounds);

      expect(nextRoom.placedItems[0]).toEqual({ itemId: 'furniture-bed', x: 350, y: 400 });
      expect(nextRoom.placedItems[1]).toEqual(sampleRoom.placedItems[1]);
    });

    it('acota la nueva posición a los límites válidos', () => {
      const nextRoom = moveItemInRoom(sampleRoom, 'furniture-lamp', { x: 50, y: 800 }, customBounds);

      expect(nextRoom.placedItems[1]).toEqual({
        itemId: 'furniture-lamp',
        x: customBounds.minX,
        y: customBounds.maxY,
      });
    });

    it('retorna la habitación original si el ítem no existe', () => {
      const nextRoom = moveItemInRoom(sampleRoom, 'non-existent', { x: 300, y: 300 }, customBounds);
      expect(nextRoom).toBe(sampleRoom);
    });

    it('retorna la habitación original si la posición es idéntica a la actual', () => {
      const nextRoom = moveItemInRoom(
        sampleRoom,
        'furniture-bed',
        { x: 200, y: 350 },
        customBounds
      );
      expect(nextRoom).toBe(sampleRoom);
    });
  });

  // ─── removeItemFromRoom ─────────────────────────────────────

  describe('removeItemFromRoom', () => {
    it('elimina el ítem especificado de la habitación de forma inmutable', () => {
      const nextRoom = removeItemFromRoom(sampleRoom, 'furniture-bed');

      expect(nextRoom.placedItems.length).toBe(1);
      expect(nextRoom.placedItems[0].itemId).toBe('furniture-lamp');
      expect(sampleRoom.placedItems.length).toBe(2);
    });

    it('retorna la habitación intacta si el ítem a retirar no está colocado', () => {
      const nextRoom = removeItemFromRoom(sampleRoom, 'ghost-item');
      expect(nextRoom).toBe(sampleRoom);
    });
  });

  // ─── placeFurnitureFromInventory ───────────────────────────

  describe('placeFurnitureFromInventory', () => {
    it('descuenta 1 unidad del inventario y coloca el mueble en la habitación', () => {
      const result = placeFurnitureFromInventory(
        sampleRoom,
        sampleInventory,
        'furniture-table',
        { x: 400, y: 380 },
        customBounds
      );

      expect(result.success).toBe(true);
      expect(result.room.placedItems.length).toBe(3);
      expect(result.room.placedItems[2]).toEqual({
        itemId: 'furniture-table',
        x: 400,
        y: 380,
      });

      const updatedItem = result.inventory.items.find((i) => i.id === 'furniture-table');
      expect(updatedItem?.quantity).toBe(1); // De 2 pasó a 1
    });

    it('elimina el ítem del inventario cuando su cantidad llega a cero', () => {
      const result = placeFurnitureFromInventory(
        sampleRoom,
        sampleInventory,
        'furniture-plant', // Tenía quantity: 1
        { x: 600, y: 400 },
        customBounds
      );

      expect(result.success).toBe(true);
      expect(result.room.placedItems.some((i) => i.itemId === 'furniture-plant')).toBe(true);
      expect(result.inventory.items.some((i) => i.id === 'furniture-plant')).toBe(false);
    });

    it('falla con success: false si el ítem no existe en el inventario', () => {
      const result = placeFurnitureFromInventory(
        sampleRoom,
        sampleInventory,
        'furniture-non-existent',
        { x: 400, y: 380 }
      );

      expect(result.success).toBe(false);
      expect(result.room).toBe(sampleRoom);
      expect(result.inventory).toBe(sampleInventory);
    });
  });

  // ─── returnFurnitureToInventory ─────────────────────────────

  describe('returnFurnitureToInventory', () => {
    it('retira el mueble de la habitación e incrementa la cantidad en el inventario existente', () => {
      // Supongamos que el inventario ya tiene 'furniture-bed' con quantity 1
      const invWithBed: Inventory = {
        items: [
          ...sampleInventory.items,
          { id: 'furniture-bed', name: 'Cama Cómoda', category: 'furniture', quantity: 1 },
        ],
      };

      const result = returnFurnitureToInventory(sampleRoom, invWithBed, 'furniture-bed');

      expect(result.success).toBe(true);
      expect(result.room.placedItems.some((i) => i.itemId === 'furniture-bed')).toBe(false);

      const bedInInventory = result.inventory.items.find((i) => i.id === 'furniture-bed');
      expect(bedInInventory?.quantity).toBe(2);
    });

    it('agrega un nuevo ítem en inventario si no existía previamente en él', () => {
      const result = returnFurnitureToInventory(
        sampleRoom,
        sampleInventory,
        'furniture-bed',
        { name: 'Cama Cómoda' }
      );

      expect(result.success).toBe(true);
      expect(result.room.placedItems.some((i) => i.itemId === 'furniture-bed')).toBe(false);

      const bedInInventory = result.inventory.items.find((i) => i.id === 'furniture-bed');
      expect(bedInInventory).toBeDefined();
      expect(bedInInventory?.name).toBe('Cama Cómoda');
      expect(bedInInventory?.quantity).toBe(1);
      expect(bedInInventory?.category).toBe('furniture');
    });

    it('falla con success: false si el ítem no está colocado en la habitación', () => {
      const result = returnFurnitureToInventory(
        sampleRoom,
        sampleInventory,
        'unplaced-furniture'
      );

      expect(result.success).toBe(false);
      expect(result.room).toBe(sampleRoom);
      expect(result.inventory).toBe(sampleInventory);
    });
  });

  // ─── DEFAULT_FLOOR_BOUNDS ──────────────────────────────────

  describe('DEFAULT_FLOOR_BOUNDS', () => {
    it('define límites válidos acordes a la perspectiva del suelo', () => {
      expect(DEFAULT_FLOOR_BOUNDS.minX).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_FLOOR_BOUNDS.maxX).toBeLessThanOrEqual(800);
      expect(DEFAULT_FLOOR_BOUNDS.minY).toBeGreaterThanOrEqual(300); // Zona de suelo
      expect(DEFAULT_FLOOR_BOUNDS.maxY).toBeLessThanOrEqual(600);
    });
  });
});
