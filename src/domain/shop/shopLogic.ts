/**
 * Lógica pura de dominio para la Tienda de Ítems y transacciones comerciales (T-08).
 *
 * Principios:
 * - R-01 (SoC): Lógica de negocio 100% pura y ciega a la UI o almacenamiento.
 * - R-03 (Inmutabilidad por Defecto): Toda operación produce nuevas estructuras inmutables.
 * - R-05 (Early Return): Validaciones defensivas tempranas (cantidades no válidas, ítems inexistentes, saldo insuficiente).
 * - R-13 ([DELICADA]): Casos de borde numéricos y prevención de desbordamientos.
 */

import type { Inventory, InventoryItem } from '../inventory';
import type { PurchaseCost, Wallet } from '../economy';
import { canAfford, purchase } from '../economy';
import type { ProcessPurchaseResult, ShopItem } from './types';
import { SHOP_CATALOG } from './shopCatalog';

/**
 * Valida de forma estricta que una cantidad de compra sea un entero positivo finito.
 */
export function validateQuantity(quantity: number): boolean {
  return (
    typeof quantity === 'number' &&
    Number.isFinite(quantity) &&
    Number.isInteger(quantity) &&
    quantity > 0
  );
}

/**
 * Calcula el costo total de una compra multiplicando el precio unitario por la cantidad.
 * Retorna null si la cantidad o el precio contienen valores inválidos o desbordan Number.MAX_SAFE_INTEGER.
 */
export function calculateTotalCost(
  price: PurchaseCost,
  quantity: number
): PurchaseCost | null {
  if (!validateQuantity(quantity)) {
    return null;
  }

  const coinsUnit = price.coins ?? 0;
  const cashUnit = price.cash ?? 0;

  // Validación defensiva de los componentes de precio
  if (
    typeof coinsUnit !== 'number' ||
    !Number.isFinite(coinsUnit) ||
    !Number.isInteger(coinsUnit) ||
    coinsUnit < 0 ||
    typeof cashUnit !== 'number' ||
    !Number.isFinite(cashUnit) ||
    !Number.isInteger(cashUnit) ||
    cashUnit < 0
  ) {
    return null;
  }

  // Prevenir desbordamiento de enteros seguros
  if (
    coinsUnit > 0 &&
    quantity > Math.floor(Number.MAX_SAFE_INTEGER / coinsUnit)
  ) {
    return null;
  }

  if (
    cashUnit > 0 &&
    quantity > Math.floor(Number.MAX_SAFE_INTEGER / cashUnit)
  ) {
    return null;
  }

  const totalCoins = coinsUnit * quantity;
  const totalCash = cashUnit * quantity;

  return {
    ...(totalCoins > 0 ? { coins: totalCoins } : {}),
    ...(totalCash > 0 ? { cash: totalCash } : {}),
  };
}

/**
 * Comprueba si la billetera dispone de fondos suficientes para comprar un ítem de la tienda.
 */
export function canAffordShopItem(
  wallet: Wallet,
  item: ShopItem,
  quantity: number = 1
): boolean {
  const totalCost = calculateTotalCost(item.price, quantity);
  if (!totalCost) {
    return false;
  }
  return canAfford(wallet, totalCost);
}

/**
 * Agrega o incrementa la cantidad de un ítem en el inventario de forma inmutable.
 * Si el ítem ya existe por ID, suma la cantidad; de lo contrario, agrega una nueva entrada.
 */
export function addItemToInventory(
  inventory: Inventory,
  item: ShopItem,
  quantity: number = 1
): Inventory {
  if (!validateQuantity(quantity)) {
    return inventory;
  }

  const existingIndex = inventory.items.findIndex((i) => i.id === item.id);

  if (existingIndex >= 0) {
    const existing = inventory.items[existingIndex];
    const updatedItem: InventoryItem = {
      ...existing,
      quantity: existing.quantity + quantity,
    };

    const nextItems = inventory.items.map((it, idx) =>
      idx === existingIndex ? updatedItem : it
    );

    return {
      items: nextItems,
    };
  }

  const newItem: InventoryItem = {
    id: item.id,
    name: item.name,
    category: item.category as import('../inventory').ItemCategory,
    quantity,
    ...(item.nutrition !== undefined ? { nutrition: item.nutrition } : {}),
    ...(item.clothingSlot !== undefined ? { clothingSlot: item.clothingSlot } : {}),
  };

  return {
    items: [...inventory.items, newItem],
  };
}

/**
 * Busca un ítem en un catálogo proporcionado.
 */
export function findShopItem(
  catalog: readonly ShopItem[],
  shopItemId: string
): ShopItem | undefined {
  return catalog.find((i) => i.id === shopItemId);
}

/**
 * Procesa la compra de un ítem de forma pura y atómica:
 * 1. Valida la cantidad y la existencia del ítem en el catálogo.
 * 2. Calcula el costo total y verifica solvencia.
 * 3. Ejecuta el débito en la billetera y la adición al inventario.
 * 4. Retorna el resultado con las nuevas instancias inmutables.
 */
export function processPurchase(
  wallet: Wallet,
  inventory: Inventory,
  shopItemId: string,
  quantity: number = 1,
  catalog: readonly ShopItem[] = SHOP_CATALOG
): ProcessPurchaseResult {
  // 1. Validación temprana de cantidad
  if (!validateQuantity(quantity)) {
    return {
      success: false,
      error: 'INVALID_QUANTITY',
      updatedWallet: wallet,
      updatedInventory: inventory,
    };
  }

  // 2. Búsqueda del ítem en el catálogo
  const item = findShopItem(catalog, shopItemId);
  if (!item) {
    return {
      success: false,
      error: 'ITEM_NOT_FOUND',
      updatedWallet: wallet,
      updatedInventory: inventory,
    };
  }

  // 3. Cálculo del costo total
  const totalCost = calculateTotalCost(item.price, quantity);
  if (!totalCost) {
    return {
      success: false,
      error: 'INVALID_PRICE',
      updatedWallet: wallet,
      updatedInventory: inventory,
      purchasedItem: item,
      quantity,
    };
  }

  // 4. Verificación de fondos
  if (!canAfford(wallet, totalCost)) {
    return {
      success: false,
      error: 'INSUFFICIENT_FUNDS',
      updatedWallet: wallet,
      updatedInventory: inventory,
      purchasedItem: item,
      quantity,
      totalCost,
    };
  }

  // 5. Débito atómico en la billetera
  const purchaseResult = purchase(
    wallet,
    totalCost,
    `Compra en tienda: ${quantity}x ${item.name}`
  );

  if (!purchaseResult.success) {
    return {
      success: false,
      error: 'INSUFFICIENT_FUNDS',
      updatedWallet: wallet,
      updatedInventory: inventory,
      purchasedItem: item,
      quantity,
      totalCost,
    };
  }

  // 6. Adición atómica al inventario
  const updatedInventory = addItemToInventory(inventory, item, quantity);

  return {
    success: true,
    updatedWallet: purchaseResult.wallet,
    updatedInventory,
    purchasedItem: item,
    quantity,
    totalCost,
  };
}
