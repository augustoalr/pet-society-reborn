import { describe, expect, it } from 'vitest';
import { RoomView } from '../RoomView';

describe('RoomView (Escenario Diorama 2.5D de Habitación)', () => {
  it('inicializa con las 5 capas procedimentales de fondo y rejilla', () => {
    const roomView = new RoomView();

    expect(roomView.label).toBe('room-background');
    expect(roomView.children.length).toBe(5);
    expect(roomView.gridVisible).toBe(false);

    roomView.destroy();
  });

  it('permite invocar renderRoom sin errores para redibujar el escenario diorama', () => {
    const roomView = new RoomView();

    expect(() => roomView.renderRoom()).not.toThrow();
    expect(roomView.children.length).toBe(5);

    roomView.destroy();
  });

  it('controla la visibilidad de las guías de la rejilla magnética', () => {
    const roomView = new RoomView();

    expect(roomView.gridVisible).toBe(false);

    roomView.setGridVisible(true);
    expect(roomView.gridVisible).toBe(true);

    roomView.setGridVisible(false);
    expect(roomView.gridVisible).toBe(false);

    roomView.destroy();
  });

  it('resalta la celda magnética más cercana y permite limpiarla', () => {
    const roomView = new RoomView();
    roomView.setGridVisible(true);

    expect(() => roomView.highlightGridCell(350, 400)).not.toThrow();
    expect(() => roomView.clearGridHighlight()).not.toThrow();

    roomView.destroy();
  });

  it('destruye la vista limpiamente liberando recursos', () => {
    const roomView = new RoomView();
    expect(() => roomView.destroy()).not.toThrow();
    expect(roomView.destroyed).toBe(true);
  });
});
