/**
 * Modelos de dominio inmutables para la Tienda de Ítems (T-08).
 *
 * Principios:
 * - R-01 (SoC): Definiciones puras de datos e interfaces de la tienda.
 * - R-03 (Inmutabilidad): Estructuras de datos estrictamente readonly.
 */

import type { ClothingSlot } from '../pet';
import type { PurchaseCost, Wallet } from '../economy';
import type { Inventory } from '../inventory';

/** Categorías de ítems comercializables en la tienda */
export type ShopCategory = 'food' | 'clothes' | 'furniture';

/** Definición inmutable de un producto a la venta en la tienda */
export interface ShopItem {
  readonly id: string;
  readonly name: string;
  readonly category: ShopCategory;
  readonly description: string;
  readonly price: PurchaseCost;
  readonly icon: string;
  /** Valor nutricional o de saciedad para ítems de categoría 'food'. */
  readonly nutrition?: number;
  /** Ranura de equipamiento para prendas de categoría 'clothes'. */
  readonly clothingSlot?: ClothingSlot;
  /** Identificador de mueble asociado para categoría 'furniture'. */
  readonly furnitureId?: string;
}

/** Códigos de error específicos para transacciones de tienda */
export type ShopErrorCode =
  | 'ITEM_NOT_FOUND'
  | 'INVALID_QUANTITY'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_PRICE';

/** Resultado inmutable del procesamiento de una compra en tienda */
export interface ProcessPurchaseResult {
  readonly success: boolean;
  readonly error?: ShopErrorCode;
  readonly updatedWallet: Wallet;
  readonly updatedInventory: Inventory;
  readonly purchasedItem?: ShopItem;
  readonly quantity?: number;
  readonly totalCost?: PurchaseCost;
}
