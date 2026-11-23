import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BottomDock } from '../BottomDock';

describe('BottomDock (Dock Inferior Flotante de Acciones Estilo Flash)', () => {
  it('renderiza los 5 botones circulares canónicos con sus etiquetas e iconos', () => {
    const html = renderToString(
      <BottomDock
        onOpenShop={vi.fn()}
        onOpenChest={vi.fn()}
        onToggleWardrobe={vi.fn()}
        onToggleDecorate={vi.fn()}
        onToggleMinigame={vi.fn()}
      />
    );

    expect(html).toContain('Tiendas');
    expect(html).toContain('🚪');
    expect(html).toContain('Baúl');
    expect(html).toContain('📦');
    expect(html).toContain('Armario');
    expect(html).toContain('👗');
    expect(html).toContain('Decorar');
    expect(html).toContain('🔨');
    expect(html).toContain('Jardín');
    expect(html).toContain('⚽');
  });

  it('muestra el badge con la cantidad de alimentos cuando foodCount > 0', () => {
    const html = renderToString(
      <BottomDock
        onOpenShop={vi.fn()}
        onOpenChest={vi.fn()}
        onToggleWardrobe={vi.fn()}
        onToggleDecorate={vi.fn()}
        onToggleMinigame={vi.fn()}
        foodCount={5}
      />
    );

    expect(html).toContain('5');
  });

  it('no muestra el badge cuando foodCount es 0 o undefined', () => {
    const html = renderToString(
      <BottomDock
        onOpenShop={vi.fn()}
        onOpenChest={vi.fn()}
        onToggleWardrobe={vi.fn()}
        onToggleDecorate={vi.fn()}
        onToggleMinigame={vi.fn()}
        foodCount={0}
      />
    );

    // No debe renderizar el badge de 0
    expect(html).not.toContain('>0<');
  });

  it('refleja el estado activo de decoración cambiando etiqueta a "Listo ✓"', () => {
    const html = renderToString(
      <BottomDock
        onOpenShop={vi.fn()}
        onOpenChest={vi.fn()}
        onToggleWardrobe={vi.fn()}
        onToggleDecorate={vi.fn()}
        onToggleMinigame={vi.fn()}
        isDecorateActive={true}
      />
    );

    expect(html).toContain('Listo ✓');
    expect(html).toContain('🛋️');
  });

  it('refleja el estado activo del minijuego cambiando etiqueta a "Casa" e icono a "🏠"', () => {
    const html = renderToString(
      <BottomDock
        onOpenShop={vi.fn()}
        onOpenChest={vi.fn()}
        onToggleWardrobe={vi.fn()}
        onToggleDecorate={vi.fn()}
        onToggleMinigame={vi.fn()}
        isMinigameActive={true}
      />
    );

    expect(html).toContain('Casa');
    expect(html).toContain('🏠');
  });
});
