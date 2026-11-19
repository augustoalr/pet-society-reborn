/**
 * Modelos de dominio inmutables para el inventario del jugador.
 */

/** Categorías de ítems disponibles en el juego. */
export type ItemCategory = 'food' | 'clothes' | 'furniture' | 'toy' | 'hygiene';

/** Un ítem individual del catálogo o del inventario. */
export interface InventoryItem {
  readonly id: string;
  readonly name: string;
  readonly category: ItemCategory;
  readonly quantity: number;
}

/** Inventario completo del jugador: lista de ítems con cantidades. */
export interface Inventory {
  readonly items: readonly InventoryItem[];
}
