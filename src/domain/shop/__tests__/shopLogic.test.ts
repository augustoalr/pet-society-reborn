import { describe, it, expect } from 'vitest';
import type { Wallet, Inventory } from '../../index';
import type { ShopItem } from '../types';
import {
  validateQuantity,
  calculateTotalCost,
  canAffordShopItem,
  addItemToInventory,
  processPurchase,
} from '../shopLogic';

describe('shopLogic (T-08)', () => {
  const sampleShopItemCoins: ShopItem = {
    id: 'food-apple',
    name: 'Manzana Fresca',
    category: 'food',
    description: 'Manzana rica',
    price: { coins: 10 },
    icon: '🍎',
    nutrition: 20,
  };

  const sampleShopItemCash: ShopItem = {
    id: 'food-golden-apple',
    name: 'Manzana Dorada',
    category: 'food',
    description: 'Manzana mística',
    price: { cash: 2 },
    icon: '🌟',
    nutrition: 100,
  };

  const sampleShopItemClothes: ShopItem = {
    id: 'party-hat',
    name: 'Gorro de Fiesta',
    category: 'clothes',
    description: 'Gorro festivo',
    price: { coins: 40 },
    icon: '🎉',
    clothingSlot: 'hat',
  };

  const testCatalog: readonly ShopItem[] = [
    sampleShopItemCoins,
    sampleShopItemCash,
    sampleShopItemClothes,
  ];

  const initialWallet: Wallet = {
    coins: 100,
    cash: 5,
  };

  const initialInventory: Inventory = {
    items: [
      {
        id: 'food-bread',
        name: 'Panecillo Tierno',
        category: 'food',
        quantity: 2,
        nutrition: 35,
      },
    ],
  };

  describe('validateQuantity', () => {
    it('acepta enteros positivos mayores que cero', () => {
      expect(validateQuantity(1)).toBe(true);
      expect(validateQuantity(5)).toBe(true);
      expect(validateQuantity(100)).toBe(true);
    });

    it('rechaza cero, números negativos y no enteros', () => {
      expect(validateQuantity(0)).toBe(false);
      expect(validateQuantity(-1)).toBe(false);
      expect(validateQuantity(-50)).toBe(false);
      expect(validateQuantity(1.5)).toBe(false);
      expect(validateQuantity(0.99)).toBe(false);
    });

    it('rechaza valores no finitos o tipos no válidos', () => {
      expect(validateQuantity(NaN)).toBe(false);
      expect(validateQuantity(Infinity)).toBe(false);
      expect(validateQuantity(-Infinity)).toBe(false);
      // @ts-expect-error probando entrada inválida en runtime
      expect(validateQuantity('1')).toBe(false);
      // @ts-expect-error probando entrada inválida en runtime
      expect(validateQuantity(null)).toBe(false);
      // @ts-expect-error probando entrada inválida en runtime
      expect(validateQuantity(undefined)).toBe(false);
    });
  });

  describe('calculateTotalCost', () => {
    it('calcula el costo total para monedas correctamente', () => {
      const result = calculateTotalCost({ coins: 15 }, 3);
      expect(result).toEqual({ coins: 45 });
    });

    it('calcula el costo total para cash correctamente', () => {
      const result = calculateTotalCost({ cash: 4 }, 2);
      expect(result).toEqual({ cash: 8 });
    });

    it('calcula el costo combinado si un ítem costara monedas y cash', () => {
      const result = calculateTotalCost({ coins: 10, cash: 1 }, 3);
      expect(result).toEqual({ coins: 30, cash: 3 });
    });

    it('retorna null si la cantidad es inválida', () => {
      expect(calculateTotalCost({ coins: 10 }, 0)).toBeNull();
      expect(calculateTotalCost({ coins: 10 }, -2)).toBeNull();
      expect(calculateTotalCost({ coins: 10 }, 2.5)).toBeNull();
    });

    it('retorna null ante precios negativos o corruptos', () => {
      expect(calculateTotalCost({ coins: -10 }, 1)).toBeNull();
      expect(calculateTotalCost({ cash: -5 }, 1)).toBeNull();
      expect(calculateTotalCost({ coins: NaN }, 1)).toBeNull();
    });

    it('retorna null ante desbordamiento de Number.MAX_SAFE_INTEGER', () => {
      expect(
        calculateTotalCost({ coins: Number.MAX_SAFE_INTEGER }, 2)
      ).toBeNull();
    });
  });

  describe('canAffordShopItem', () => {
    it('retorna true si el jugador cuenta con suficientes monedas', () => {
      expect(canAffordShopItem(initialWallet, sampleShopItemCoins, 1)).toBe(true);
      expect(canAffordShopItem(initialWallet, sampleShopItemCoins, 10)).toBe(true);
    });

    it('retorna false si el saldo de monedas no alcanza', () => {
      expect(canAffordShopItem(initialWallet, sampleShopItemCoins, 11)).toBe(false);
    });

    it('retorna true si el jugador tiene suficiente cash', () => {
      expect(canAffordShopItem(initialWallet, sampleShopItemCash, 2)).toBe(true);
    });

    it('retorna false si el saldo de cash no alcanza', () => {
      expect(canAffordShopItem(initialWallet, sampleShopItemCash, 3)).toBe(false);
    });

    it('retorna false si la cantidad solicitada es inválida', () => {
      expect(canAffordShopItem(initialWallet, sampleShopItemCoins, 0)).toBe(false);
      expect(canAffordShopItem(initialWallet, sampleShopItemCoins, -1)).toBe(false);
    });
  });

  describe('addItemToInventory', () => {
    it('agrega un nuevo ítem cuando no existía en el inventario', () => {
      const result = addItemToInventory(initialInventory, sampleShopItemCoins, 2);

      expect(result.items).toHaveLength(2);
      const added = result.items.find((i) => i.id === sampleShopItemCoins.id);
      expect(added).toBeDefined();
      expect(added?.quantity).toBe(2);
      expect(added?.name).toBe('Manzana Fresca');
      expect(added?.nutrition).toBe(20);
      expect(added?.category).toBe('food');
    });

    it('acumula la cantidad si el ítem ya existía en el inventario', () => {
      const inventoryWithApples: Inventory = {
        items: [
          {
            id: 'food-apple',
            name: 'Manzana Fresca',
            category: 'food',
            quantity: 3,
            nutrition: 20,
          },
        ],
      };

      const result = addItemToInventory(inventoryWithApples, sampleShopItemCoins, 4);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].quantity).toBe(7);
      expect(inventoryWithApples.items[0].quantity).toBe(3); // Inmutabilidad del original
    });

    it('conserva propiedades de ropa como clothingSlot al agregar', () => {
      const result = addItemToInventory(initialInventory, sampleShopItemClothes, 1);
      const added = result.items.find((i) => i.id === sampleShopItemClothes.id);
      expect(added).toBeDefined();
      expect(added?.clothingSlot).toBe('hat');
    });

    it('no muta el inventario original (Inmutabilidad estricta)', () => {
      const originalCount = initialInventory.items.length;
      const originalFirstItemQty = initialInventory.items[0].quantity;

      addItemToInventory(initialInventory, sampleShopItemCoins, 5);

      expect(initialInventory.items).toHaveLength(originalCount);
      expect(initialInventory.items[0].quantity).toBe(originalFirstItemQty);
    });
  });

  describe('processPurchase', () => {
    it('completa exitosamente una compra en monedas', () => {
      const result = processPurchase(
        initialWallet,
        initialInventory,
        'food-apple',
        2,
        testCatalog
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.updatedWallet.coins).toBe(80); // 100 - (10 * 2)
      expect(result.updatedWallet.cash).toBe(5);
      expect(result.totalCost).toEqual({ coins: 20 });
      expect(result.purchasedItem?.id).toBe('food-apple');

      const appleInInventory = result.updatedInventory.items.find(
        (i) => i.id === 'food-apple'
      );
      expect(appleInInventory).toBeDefined();
      expect(appleInInventory?.quantity).toBe(2);
    });

    it('completa exitosamente una compra en cash', () => {
      const result = processPurchase(
        initialWallet,
        initialInventory,
        'food-golden-apple',
        1,
        testCatalog
      );

      expect(result.success).toBe(true);
      expect(result.updatedWallet.coins).toBe(100);
      expect(result.updatedWallet.cash).toBe(3); // 5 - 2
      expect(result.totalCost).toEqual({ cash: 2 });

      const goldenApple = result.updatedInventory.items.find(
        (i) => i.id === 'food-golden-apple'
      );
      expect(goldenApple?.quantity).toBe(1);
    });

    it('rechaza con INSUFFICIENT_FUNDS si las monedas no alcanzan', () => {
      const poorWallet: Wallet = { coins: 5, cash: 0 };
      const result = processPurchase(
        poorWallet,
        initialInventory,
        'food-apple',
        1,
        testCatalog
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
      expect(result.updatedWallet).toEqual(poorWallet);
      expect(result.updatedInventory).toEqual(initialInventory);
    });

    it('rechaza con INSUFFICIENT_FUNDS si el cash no alcanza', () => {
      const walletNoCash: Wallet = { coins: 500, cash: 1 };
      const result = processPurchase(
        walletNoCash,
        initialInventory,
        'food-golden-apple',
        1,
        testCatalog
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
      expect(result.updatedWallet).toEqual(walletNoCash);
      expect(result.updatedInventory).toEqual(initialInventory);
    });

    it('rechaza con ITEM_NOT_FOUND si el ítem no existe en el catálogo', () => {
      const result = processPurchase(
        initialWallet,
        initialInventory,
        'inexistent-item',
        1,
        testCatalog
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('ITEM_NOT_FOUND');
      expect(result.updatedWallet).toEqual(initialWallet);
      expect(result.updatedInventory).toEqual(initialInventory);
    });

    it('rechaza con INVALID_QUANTITY ante cantidades menores o iguales a 0 o decimales', () => {
      const resultZero = processPurchase(
        initialWallet,
        initialInventory,
        'food-apple',
        0,
        testCatalog
      );
      expect(resultZero.success).toBe(false);
      expect(resultZero.error).toBe('INVALID_QUANTITY');

      const resultNeg = processPurchase(
        initialWallet,
        initialInventory,
        'food-apple',
        -3,
        testCatalog
      );
      expect(resultNeg.success).toBe(false);
      expect(resultNeg.error).toBe('INVALID_QUANTITY');

      const resultFloat = processPurchase(
        initialWallet,
        initialInventory,
        'food-apple',
        1.5,
        testCatalog
      );
      expect(resultFloat.success).toBe(false);
      expect(resultFloat.error).toBe('INVALID_QUANTITY');
    });

    it('mantiene la inmutabilidad de los argumentos de entrada en caso de éxito o fallo', () => {
      const walletCopy = { ...initialWallet };
      const inventoryItemsCopy = [...initialInventory.items];

      processPurchase(initialWallet, initialInventory, 'food-apple', 1, testCatalog);

      expect(initialWallet).toEqual(walletCopy);
      expect(initialInventory.items).toEqual(inventoryItemsCopy);
    });
  });
});
