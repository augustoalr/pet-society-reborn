import { describe, expect, it } from 'vitest';
import { RoomView } from '../RoomView';

describe('RoomView (Escenario 2D de Habitación)', () => {
  it('inicializa con las 4 capas procedimentales de fondo', () => {
    const roomView = new RoomView();

    expect(roomView.label).toBe('room-background');
    expect(roomView.children.length).toBe(4);

    roomView.destroy();
  });

  it('permite invocar renderRoom sin errores para redibujar el escenario', () => {
    const roomView = new RoomView();

    expect(() => roomView.renderRoom()).not.toThrow();
    expect(roomView.children.length).toBe(4);

    roomView.destroy();
  });

  it('destruye la vista limpiamente liberando recursos', () => {
    const roomView = new RoomView();
    expect(() => roomView.destroy()).not.toThrow();
    expect(roomView.destroyed).toBe(true);
  });
});
