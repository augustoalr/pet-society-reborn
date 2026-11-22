import { describe, expect, it, vi } from 'vitest';
import type { FederatedPointerEvent } from 'pixi.js';
import { FurnitureView } from '../FurnitureView';
import { DEFAULT_FLOOR_GRID, type Bounds } from '../../../domain';

describe('FurnitureView (Vista y Manipulación de Muebles)', () => {
  const bounds: Bounds = {
    minX: 100,
    maxX: 700,
    minY: 200,
    maxY: 500,
  };

  it('inicializa con el ID de ítem, posición acotada y sombra para muebles de suelo', () => {
    const furniture = new FurnitureView('furniture-bed', 300, 400, bounds);

    expect(furniture.itemId).toBe('furniture-bed');
    expect(furniture.virtualX).toBe(300);
    expect(furniture.virtualY).toBe(400);
    expect(furniture.zIndex).toBe(400);
    expect(furniture.placementLayer).toBe('floor');
    expect(furniture.hasShadow).toBe(true);
    expect(furniture.shadow).toBeDefined();

    furniture.destroy();
  });

  it('no proyecta sombra de contacto en el suelo para decoraciones de pared', () => {
    const wallItem = new FurnitureView('wall-painting', 300, 150, bounds);

    expect(wallItem.itemId).toBe('wall-painting');
    expect(wallItem.placementLayer).toBe('wall');
    expect(wallItem.hasShadow).toBe(false);

    wallItem.destroy();
  });

  it('acota la posición inicial si se crea fuera de límites', () => {
    const furniture = new FurnitureView('furniture-table', 50, 999, bounds);

    expect(furniture.virtualX).toBe(bounds.minX);
    expect(furniture.virtualY).toBe(bounds.maxY);
    expect(furniture.zIndex).toBe(bounds.maxY);

    furniture.destroy();
  });

  it('cambia el cursor y modo de eventos según setDecoratingMode', () => {
    const furniture = new FurnitureView('furniture-lamp', 200, 300, bounds);

    // Por defecto modo no decorador
    furniture.setDecoratingMode(false);
    expect(furniture.eventMode).toBe('none');
    expect(furniture.cursor).toBe('default');

    // Al activar modo decorar
    furniture.setDecoratingMode(true);
    expect(furniture.eventMode).toBe('static');
    expect(furniture.cursor).toBe('grab');

    furniture.destroy();
  });

  it('gestiona la selección y dibuja recuadro resaltado', () => {
    const furniture = new FurnitureView('furniture-plant', 350, 350, bounds);
    furniture.setDecoratingMode(true);

    expect(furniture.selected).toBe(false);

    furniture.setSelected(true);
    expect(furniture.selected).toBe(true);

    furniture.setSelected(false);
    expect(furniture.selected).toBe(false);

    furniture.destroy();
  });

  it('notifica cambios de profundidad al actualizar posición', () => {
    const depthChangeSpy = vi.fn();
    const furniture = new FurnitureView('furniture-bed', 300, 300, bounds);
    furniture.setOnDepthChange(depthChangeSpy);

    furniture.setPosition(300, 450);

    expect(furniture.virtualY).toBe(450);
    expect(furniture.zIndex).toBe(450);
    expect(depthChangeSpy).toHaveBeenCalled();

    furniture.destroy();
  });

  it('eleva el mueble con escala reactiva durante el arrastre y mantiene la sombra en el suelo', () => {
    const furniture = new FurnitureView('furniture-bed', 300, 400, bounds);
    furniture.setDecoratingMode(true);

    const dragStartSpy = vi.fn();
    const dragMoveSpy = vi.fn();
    const dragEndSpy = vi.fn();
    const moveEndSpy = vi.fn();

    furniture.setOnDragStart(dragStartSpy);
    furniture.setOnDragMove(dragMoveSpy);
    furniture.setOnDragEnd(dragEndSpy);
    furniture.setOnMoveEnd(moveEndSpy);

    expect(furniture.isElevated).toBe(false);

    // 1. Simular pointerdown (inicio de arrastre)
    furniture.emit('pointerdown', {
      stopPropagation: vi.fn(),
      global: { x: 300, y: 400 },
    } as unknown as FederatedPointerEvent);

    expect(furniture.dragging).toBe(true);
    expect(furniture.isElevated).toBe(true); // Elevado respecto al suelo
    expect(dragStartSpy).toHaveBeenCalled();

    // 2. Simular globalpointermove (movimiento)
    furniture.emit('globalpointermove', {
      global: { x: 380, y: 420 },
    } as unknown as FederatedPointerEvent);

    expect(dragMoveSpy).toHaveBeenCalled();

    // 3. Simular pointerup (fin de arrastre con snap magnético)
    furniture.emit('pointerup', {} as unknown as FederatedPointerEvent);

    expect(furniture.dragging).toBe(false);
    expect(furniture.isElevated).toBe(false); // Vuelve a posarse en el suelo
    expect(dragEndSpy).toHaveBeenCalled();
    expect(moveEndSpy).toHaveBeenCalled();

    // Las coordenadas finales notificadas deben coincidir con una celda válida de la rejilla
    const finalPos = moveEndSpy.mock.calls[0][0];
    const matchingCell = DEFAULT_FLOOR_GRID.cells.find(
      (c) => c.x === finalPos.x && c.y === finalPos.y
    );
    expect(matchingCell).toBeDefined();

    furniture.destroy();
  });
});
