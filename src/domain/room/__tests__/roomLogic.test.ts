import { describe, it, expect } from 'vitest';
import {
  DEFAULT_ROOM_BOUNDS,
  DEFAULT_FLOOR_BOUNDS,
  WALL_BOUNDS,
  DEFAULT_FLOOR_GRID,
  DEFAULT_WALL_GRID,
  createRoomGrid,
  snapToGrid,
  findNearestGridCell,
  getItemPlacementLayer,
  getValidBoundsForLayer,
  isValidPlacementPosition,
  canPlaceItemAt,
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

  // ─── Rejilla Magnética (RoomGrid y snapToGrid) ────────────────

  describe('createRoomGrid', () => {
    it('genera una rejilla con la cantidad correcta de celdas y coordenadas centradas', () => {
      const grid = createRoomGrid({
        cols: 4,
        rows: 2,
        cellWidth: 100,
        cellHeight: 60,
        originX: 100,
        originY: 300,
        layer: 'floor',
      });

      expect(grid.cols).toBe(4);
      expect(grid.rows).toBe(2);
      expect(grid.cells.length).toBe(8);
      expect(grid.layer).toBe('floor');

      // Primera celda: col 0, row 0 -> centro en (100 + 50, 300 + 30) = (150, 330)
      const firstCell = grid.cells[0];
      expect(firstCell).toEqual({ col: 0, row: 0, x: 150, y: 330, layer: 'floor' });

      // Última celda: col 3, row 1 -> centro en (100 + 3*100 + 50, 300 + 60 + 30) = (450, 390)
      const lastCell = grid.cells[7];
      expect(lastCell).toEqual({ col: 3, row: 1, x: 450, y: 390, layer: 'floor' });
    });

    it('DEFAULT_FLOOR_GRID tiene 32 celdas de suelo estrictamente dentro de DEFAULT_FLOOR_BOUNDS', () => {
      expect(DEFAULT_FLOOR_GRID.cells.length).toBe(32);
      expect(DEFAULT_FLOOR_GRID.layer).toBe('floor');

      for (const cell of DEFAULT_FLOOR_GRID.cells) {
        expect(cell.x).toBeGreaterThanOrEqual(DEFAULT_FLOOR_BOUNDS.minX);
        expect(cell.x).toBeLessThanOrEqual(DEFAULT_FLOOR_BOUNDS.maxX);
        expect(cell.y).toBeGreaterThanOrEqual(DEFAULT_FLOOR_BOUNDS.minY);
        expect(cell.y).toBeLessThanOrEqual(DEFAULT_FLOOR_BOUNDS.maxY);
      }
    });

    it('DEFAULT_WALL_GRID tiene celdas de pared dentro de WALL_BOUNDS', () => {
      expect(DEFAULT_WALL_GRID.cells.length).toBe(12);
      expect(DEFAULT_WALL_GRID.layer).toBe('wall');

      for (const cell of DEFAULT_WALL_GRID.cells) {
        expect(cell.x).toBeGreaterThanOrEqual(WALL_BOUNDS.minX);
        expect(cell.x).toBeLessThanOrEqual(WALL_BOUNDS.maxX);
        expect(cell.y).toBeGreaterThanOrEqual(WALL_BOUNDS.minY);
        expect(cell.y).toBeLessThanOrEqual(WALL_BOUNDS.maxY);
      }
    });
  });

  describe('snapToGrid & findNearestGridCell', () => {
    it('retorna las coordenadas exactas de la celda cuando la posición coincide', () => {
      const targetCell = DEFAULT_FLOOR_GRID.cells[5];
      const snapped = snapToGrid({ x: targetCell.x, y: targetCell.y }, DEFAULT_FLOOR_GRID);

      expect(snapped).toEqual({ x: targetCell.x, y: targetCell.y });
    });

    it('atrae magnéticamente una posición cercana al centro de la celda más próxima', () => {
      const cell = DEFAULT_FLOOR_GRID.cells[0]; // (120, 365)
      // Posición ligeramente desviada (+5 en X, -8 en Y)
      const nearPos = { x: cell.x + 5, y: cell.y - 8 };
      const snapped = snapToGrid(nearPos, DEFAULT_FLOOR_GRID);

      expect(snapped.x).toBe(cell.x);
      expect(snapped.y).toBe(cell.y);
    });

    it('acota y atrae coordenadas lejanas o fuera de límites a la celda perimetral más cercana', () => {
      const farPos = { x: -500, y: -500 };
      const snapped = snapToGrid(farPos, DEFAULT_FLOOR_GRID);

      // Debe caer en la esquina superior izquierda (col 0, row 0)
      const cornerCell = DEFAULT_FLOOR_GRID.cells[0];
      expect(snapped).toEqual({ x: cornerCell.x, y: cornerCell.y });
    });

    it('findNearestGridCell retorna la celda completa o null ante coordenadas inválidas', () => {
      const cell = findNearestGridCell({ x: 200, y: 400 }, DEFAULT_FLOOR_GRID);
      expect(cell).toBeDefined();
      expect(cell?.layer).toBe('floor');

      expect(findNearestGridCell({ x: NaN, y: 100 }, DEFAULT_FLOOR_GRID)).toBeNull();
    });

    it('snapToGrid maneja valores NaN con seguridad retornando coordenadas no-NaN', () => {
      const fallback = snapToGrid({ x: NaN, y: NaN }, DEFAULT_FLOOR_GRID);
      expect(Number.isFinite(fallback.x)).toBe(true);
      expect(Number.isFinite(fallback.y)).toBe(true);
    });
  });

  // ─── Capas de Colocación (Floor vs Wall) y Validación ────────

  describe('Discriminación de Capas (getItemPlacementLayer, canPlaceItemAt)', () => {
    it('identifica correctamente muebles de suelo vs decoraciones de pared', () => {
      expect(getItemPlacementLayer('furniture-bed')).toBe('floor');
      expect(getItemPlacementLayer('furniture-table')).toBe('floor');
      expect(getItemPlacementLayer('furniture-lamp')).toBe('floor');
      expect(getItemPlacementLayer('furniture-plant')).toBe('floor');

      expect(getItemPlacementLayer('wall-painting')).toBe('wall');
      expect(getItemPlacementLayer('wall-window')).toBe('wall');
      expect(getItemPlacementLayer('wall-clock')).toBe('wall');
      expect(getItemPlacementLayer('decorative-painting-1')).toBe('wall');
    });

    it('obtiene los límites correctos según la capa de colocación', () => {
      expect(getValidBoundsForLayer('floor')).toEqual(DEFAULT_FLOOR_BOUNDS);
      expect(getValidBoundsForLayer('wall')).toEqual(WALL_BOUNDS);
    });

    it('valida que los muebles de suelo solo puedan ubicarse en el suelo (no en la pared)', () => {
      const floorPosition = { x: 300, y: 420 };
      const wallPosition = { x: 300, y: 150 };

      // Cama en el suelo: válido
      expect(canPlaceItemAt('furniture-bed', floorPosition)).toBe(true);
      // Cama flotando en la pared: INVÁLIDO
      expect(canPlaceItemAt('furniture-bed', wallPosition)).toBe(false);
    });

    it('valida que los cuadros y decoraciones de pared solo puedan ubicarse en la pared', () => {
      const floorPosition = { x: 300, y: 420 };
      const wallPosition = { x: 300, y: 150 };

      // Cuadro en la pared: válido
      expect(canPlaceItemAt('wall-painting', wallPosition)).toBe(true);
      // Cuadro tirado en el suelo: INVÁLIDO
      expect(canPlaceItemAt('wall-painting', floorPosition)).toBe(false);
    });

    it('isValidPlacementPosition retorna false para coordenadas fuera del lienzo', () => {
      expect(isValidPlacementPosition({ x: 999, y: 400 }, 'floor')).toBe(false);
      expect(isValidPlacementPosition({ x: 400, y: 999 }, 'floor')).toBe(false);
      expect(isValidPlacementPosition({ x: 400, y: 50 }, 'floor')).toBe(false); // Es pared
    });
  });

  // ─── placeItemInRoom ────────────────────────────────────────

  describe('placeItemInRoom', () => {
    it('agrega un nuevo mueble a la habitación respetando los límites válidos', () => {
      const newItem: PlacedItem = { itemId: 'furniture-table', x: 450, y: 400 };
      const nextRoom = placeItemInRoom(sampleRoom, newItem, customBounds);

      expect(nextRoom.placedItems.length).toBe(3);
      expect(nextRoom.placedItems[2]).toEqual({
        itemId: 'furniture-table',
        x: 450,
        y: 400,
        layer: 'floor',
      });
      expect(nextRoom).not.toBe(sampleRoom);
    });

    it('acota automáticamente las coordenadas si exceden los límites especificados', () => {
      const outOfBoundsItem: PlacedItem = { itemId: 'furniture-table', x: 999, y: 999 };
      const nextRoom = placeItemInRoom(sampleRoom, outOfBoundsItem, customBounds);

      expect(nextRoom.placedItems[2]).toEqual({
        itemId: 'furniture-table',
        x: customBounds.maxX,
        y: customBounds.maxY,
        layer: 'floor',
      });
    });

    it('actualiza la posición si el ítem ya existía en la habitación sin duplicarlo', () => {
      const updatedBed: PlacedItem = { itemId: 'furniture-bed', x: 500, y: 450 };
      const nextRoom = placeItemInRoom(sampleRoom, updatedBed, customBounds);

      expect(nextRoom.placedItems.length).toBe(2);
      expect(nextRoom.placedItems[0]).toEqual({
        itemId: 'furniture-bed',
        x: 500,
        y: 450,
        layer: 'floor',
      });
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

      expect(nextRoom.placedItems[0]).toEqual({
        itemId: 'furniture-bed',
        x: 350,
        y: 400,
      });
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
        layer: 'floor',
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

  // ─── DEFAULT_FLOOR_BOUNDS y WALL_BOUNDS ─────────────────────

  describe('DEFAULT_FLOOR_BOUNDS & WALL_BOUNDS', () => {
    it('DEFAULT_FLOOR_BOUNDS define límites acordes a la perspectiva del suelo (340 a 540 Y)', () => {
      expect(DEFAULT_FLOOR_BOUNDS.minX).toBe(60);
      expect(DEFAULT_FLOOR_BOUNDS.maxX).toBe(740);
      expect(DEFAULT_FLOOR_BOUNDS.minY).toBe(340);
      expect(DEFAULT_FLOOR_BOUNDS.maxY).toBe(540);
    });

    it('WALL_BOUNDS define límites acordes al área superior de pared (60 a 290 Y)', () => {
      expect(WALL_BOUNDS.minX).toBe(60);
      expect(WALL_BOUNDS.maxX).toBe(740);
      expect(WALL_BOUNDS.minY).toBe(60);
      expect(WALL_BOUNDS.maxY).toBe(290);
      // No debe superponerse con el suelo
      expect(WALL_BOUNDS.maxY).toBeLessThan(DEFAULT_FLOOR_BOUNDS.minY);
    });
  });
});
