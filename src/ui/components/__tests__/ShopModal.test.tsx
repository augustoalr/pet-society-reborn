import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ShopModal } from '../ShopModal';
import type { Wallet } from '../../../domain';
import type { ShopItem } from '../../../domain/shop';

describe('ShopModal (Componente de Tienda)', () => {
  const sampleWallet: Wallet = {
    coins: 100,
    cash: 5,
  };

  const sampleCatalog: readonly ShopItem[] = [
    {
      id: 'food-apple',
      name: 'Manzana Fresca',
      category: 'food',
      description: 'Una manzana roja jugosa y crujiente.',
      price: { coins: 10 },
      icon: '🍎',
      nutrition: 20,
    },
    {
      id: 'party-hat',
      name: 'Gorro de Fiesta',
      category: 'clothes',
      description: 'Cono festivo morado y amarillo.',
      price: { coins: 40 },
      icon: '🎉',
      clothingSlot: 'hat',
    },
    {
      id: 'furniture-bed',
      name: 'Cama Cómoda',
      category: 'furniture',
      description: 'Cama clásica de madera con sábanas suaves.',
      price: { coins: 80 },
      icon: '🛏️',
      furnitureId: 'furniture-bed',
    },
    {
      id: 'luxury-item',
      name: 'Objeto Inalcanzable',
      category: 'clothes',
      description: 'Artículo demasiado costoso para el saldo actual.',
      price: { coins: 9999 },
      icon: '💎',
      clothingSlot: 'accessory',
    },
  ];

  it('no renderiza nada cuando isOpen es false', () => {
    const html = renderToString(
      <ShopModal
        isOpen={false}
        wallet={sampleWallet}
        onClose={vi.fn()}
        onBuyItem={vi.fn()}
      />
    );

    expect(html).toBe('');
  });

  it('renderiza la cabecera, saldo del jugador y pestañas de categoría cuando isOpen es true', () => {
    const html = renderToString(
      <ShopModal
        isOpen={true}
        wallet={sampleWallet}
        onClose={vi.fn()}
        onBuyItem={vi.fn()}
        catalog={sampleCatalog}
      />
    );

    expect(html).toContain('Tienda de Pet Society');
    expect(html).toContain('100'); // Saldo de coins
    expect(html).toContain('5'); // Saldo de cash
    expect(html).toContain('Todos');
    expect(html).toContain('Comida');
    expect(html).toContain('Ropa');
    expect(html).toContain('Muebles');
  });

  it('muestra las tarjetas de productos con sus nombres, descripciones y precios', () => {
    const html = renderToString(
      <ShopModal
        isOpen={true}
        wallet={sampleWallet}
        onClose={vi.fn()}
        onBuyItem={vi.fn()}
        catalog={sampleCatalog}
      />
    );

    expect(html).toContain('Manzana Fresca');
    expect(html).toContain('+20 Saciedad');
    expect(html).toContain('10 Monedas');

    expect(html).toContain('Gorro de Fiesta');
    expect(html).toContain('Sombrero');
    expect(html).toContain('40 Monedas');

    expect(html).toContain('Cama Cómoda');
    expect(html).toContain('Mueble de Sala');
    expect(html).toContain('80 Monedas');
  });

  it('deshabilita el botón de compra para ítems que superan el saldo del jugador', () => {
    const poorWallet: Wallet = { coins: 5, cash: 0 };
    const html = renderToString(
      <ShopModal
        isOpen={true}
        wallet={poorWallet}
        onClose={vi.fn()}
        onBuyItem={vi.fn()}
        catalog={sampleCatalog}
      />
    );

    // Todos los ítems de sampleCatalog cuestan >= 10 monedas, por lo que deben mostrar "Sin saldo"
    expect(html).toContain('Sin saldo');
    expect(html).toContain('disabled');
  });

  it('muestra estado vacío cuando el catálogo no contiene ítems', () => {
    const html = renderToString(
      <ShopModal
        isOpen={true}
        wallet={sampleWallet}
        onClose={vi.fn()}
        onBuyItem={vi.fn()}
        catalog={[]}
      />
    );

    expect(html).toContain('No hay productos en esta categoría');
  });
});
