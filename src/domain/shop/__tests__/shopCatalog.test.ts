import { describe, it, expect } from 'vitest';
import { BASE_FURNITURE_CATALOG } from '../../../game';
import {
  SHOP_CATALOG,
  getShopItemById,
  getShopItemsByCategory,
} from '../shopCatalog';

describe('shopCatalog (T-08)', () => {
  it('ofrece ítems en todas las categorías principales (food, clothes, furniture)', () => {
    const foodItems = getShopItemsByCategory('food');
    const clothesItems = getShopItemsByCategory('clothes');
    const furnitureItems = getShopItemsByCategory('furniture');

    expect(foodItems.length).toBeGreaterThan(0);
    expect(clothesItems.length).toBeGreaterThan(0);
    expect(furnitureItems.length).toBeGreaterThan(0);
  });

  it('todos los ítems tienen identificadores únicos no vacíos', () => {
    const ids = SHOP_CATALOG.map((item) => item.id);
    const uniqueIds = new Set(ids);

    expect(ids.length).toBe(uniqueIds.size);
    ids.forEach((id) => {
      expect(typeof id).toBe('string');
      expect(id.trim().length).toBeGreaterThan(0);
    });
  });

  it('todos los ítems tienen precios válidos en monedas o cash', () => {
    SHOP_CATALOG.forEach((item) => {
      const { coins, cash } = item.price;
      const hasCoins = coins !== undefined && coins > 0 && Number.isInteger(coins);
      const hasCash = cash !== undefined && cash > 0 && Number.isInteger(cash);

      expect(hasCoins || hasCash).toBe(true);
      expect(item.name.trim().length).toBeGreaterThan(0);
      expect(item.description.trim().length).toBeGreaterThan(0);
      expect(item.icon.trim().length).toBeGreaterThan(0);
    });
  });

  it('los ítems de comida definen un valor nutricional positivo', () => {
    const foodItems = getShopItemsByCategory('food');
    foodItems.forEach((food) => {
      expect(food.nutrition).toBeDefined();
      expect(food.nutrition).toBeGreaterThan(0);
    });
  });

  it('los ítems de ropa definen una ranura válida (hat, shirt o accessory)', () => {
    const clothesItems = getShopItemsByCategory('clothes');
    clothesItems.forEach((clothing) => {
      expect(clothing.clothingSlot).toBeDefined();
      expect(['hat', 'shirt', 'accessory']).toContain(clothing.clothingSlot);
    });
  });

  it('los ítems de muebles enlazan con definiciones válidas del catálogo de habitación', () => {
    const furnitureItems = getShopItemsByCategory('furniture');
    furnitureItems.forEach((furniture) => {
      expect(furniture.furnitureId).toBeDefined();
      const baseExists = BASE_FURNITURE_CATALOG.some(
        (def) => def.id === furniture.furnitureId
      );
      expect(baseExists).toBe(true);
    });
  });

  it('getShopItemById encuentra un ítem existente y retorna undefined si no existe', () => {
    const apple = getShopItemById('food-apple');
    expect(apple).toBeDefined();
    expect(apple?.name).toBe('Manzana Fresca');

    const unknown = getShopItemById('inexistent-id-999');
    expect(unknown).toBeUndefined();
  });
});
