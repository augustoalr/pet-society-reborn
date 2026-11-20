/**
 * Modelos de dominio inmutables para el inventario del jugador.
 */

import type { ClothingSlot } from '../pet';

/** Categorías de ítems disponibles en el juego. */
export type ItemCategory = 'food' | 'clothes' | 'furniture' | 'toy' | 'hygiene';

/** Un ítem individual del catálogo o del inventario. */
export interface InventoryItem {
  readonly id: string;
  readonly name: string;
  readonly category: ItemCategory;
  readonly quantity: number;
  /** Valor nutricional o de saciedad para ítems de categoría 'food'. */
  readonly nutrition?: number;
  /** Ranura de ropa o accesorio para ítems de categoría 'clothes'. */
  readonly clothingSlot?: ClothingSlot;
}

/** Inventario completo del jugador: lista de ítems con cantidades. */
export interface Inventory {
  readonly items: readonly InventoryItem[];
}
