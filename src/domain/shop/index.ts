export type {
  ShopCategory,
  ShopItem,
  ShopErrorCode,
  ProcessPurchaseResult,
} from './types';

export {
  SHOP_CATALOG,
  getShopItemById,
  getShopItemsByCategory,
} from './shopCatalog';

export {
  validateQuantity,
  calculateTotalCost,
  canAffordShopItem,
  addItemToInventory,
  findShopItem,
  processPurchase,
} from './shopLogic';
