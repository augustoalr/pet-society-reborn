import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { DecorationPanel } from '../DecorationPanel';
import type { Inventory, Room } from '../../../domain';

describe('DecorationPanel (UI de Modo Decoración)', () => {
  const sampleInventory: Inventory = {
    items: [
      {
        id: 'furniture-bed',
        name: 'Cama Cómoda',
        category: 'furniture',
        quantity: 2,
      },
      {
        id: 'food-apple',
        name: 'Manzana',
        category: 'food',
        quantity: 1,
      },
    ],
  };

  const sampleRoom: Room = {
    id: 'room-1',
    name: 'Mi Habitación',
    placedItems: [
      { itemId: 'furniture-table', x: 400, y: 380 },
    ],
  };

  it('renderiza la interfaz del baúl con los muebles de inventario disponibles', () => {
    const html = renderToString(
      <DecorationPanel
        inventory={sampleInventory}
        room={sampleRoom}
        selectedItemId={null}
        onPlaceItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onSelectPlacedItem={vi.fn()}
      />
    );

    expect(html).toContain('Baúl de Muebles');
    expect(html).toContain('Cama Cómoda');
    expect(html).toContain('Colocar en Sala');
    expect(html).toContain('En Habitación');
  });

  it('muestra mensaje amigable cuando no hay muebles disponibles en el baúl', () => {
    const emptyInventory: Inventory = {
      items: [
        { id: 'food-apple', name: 'Manzana', category: 'food', quantity: 3 },
      ],
    };

    const html = renderToString(
      <DecorationPanel
        inventory={emptyInventory}
        room={sampleRoom}
        selectedItemId={null}
        onPlaceItem={vi.fn()}
        onRemoveItem={vi.fn()}
        onSelectPlacedItem={vi.fn()}
      />
    );

    expect(html).toContain('No tienes muebles en tu baúl');
  });
});
