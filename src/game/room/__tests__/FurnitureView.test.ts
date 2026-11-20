import { describe, expect, it, vi } from 'vitest';
import { FurnitureView } from '../FurnitureView';
import type { Bounds } from '../../../domain';

describe('FurnitureView (Vista y Manipulación de Muebles)', () => {
  const bounds: Bounds = {
    minX: 100,
    maxX: 700,
    minY: 200,
    maxY: 500,
  };

  it('inicializa con el ID de ítem y posición acotada', () => {
    const furniture = new FurnitureView('furniture-bed', 300, 400, bounds);

    expect(furniture.itemId).toBe('furniture-bed');
    expect(furniture.virtualX).toBe(300);
    expect(furniture.virtualY).toBe(400);
    expect(furniture.zIndex).toBe(400);

    furniture.destroy();
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
});
