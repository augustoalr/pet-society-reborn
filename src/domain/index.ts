export type {
  Pet,
  PetNeeds,
  PetAppearance,
  PetColor,
  EyeStyle,
  MouthStyle,
  EarStyle,
  ClothingSlot,
  ClothingItemId,
  PetClothes,
} from './pet';

export {
  HUNGER_DECAY_RATE,
  HYGIENE_DECAY_RATE,
  ENERGY_DECAY_RATE,
  HAPPINESS_DECAY_RATE,
  HAPPINESS_CRITICAL_DECAY_MULTIPLIER,
  CRITICAL_NEED_THRESHOLD,
  DEFAULT_FOOD_NUTRITION,
  DEFAULT_CLEAN_EFFICIENCY,
  DEFAULT_CLEAN_HAPPINESS_BOOST,
  DEFAULT_PET_HAPPINESS_BOOST,
  clampNeed,
  calculateNeedsDecay,
  feedPet,
  cleanPet,
  petAnimal,
} from './pet';

export type {
  Wallet,
  CurrencyType,
  TransactionType,
  EconomyErrorCode,
  Transaction,
  TransactionResult,
  PurchaseCost,
} from './economy';

export {
  validateAmount,
  generateTransactionId,
  creditCurrency,
  debitCurrency,
  canAfford,
  purchase,
} from './economy';
export type { InventoryItem, Inventory, ItemCategory } from './inventory';
export type { Room, PlacedItem, Bounds } from './room';
export {
  DEFAULT_ROOM_BOUNDS,
  DEFAULT_FLOOR_BOUNDS,
  clampToBounds,
  isWithinBounds,
  placeItemInRoom,
  moveItemInRoom,
  removeItemFromRoom,
  placeFurnitureFromInventory,
  returnFurnitureToInventory,
} from './room';
export type { GameState } from './game';
export { createDefaultGameState } from './game';

export type {
  ShopCategory,
  ShopItem,
  ShopErrorCode,
  ProcessPurchaseResult,
} from './shop';

export {
  SHOP_CATALOG,
  getShopItemById,
  getShopItemsByCategory,
  validateQuantity,
  calculateTotalCost,
  canAffordShopItem,
  addItemToInventory,
  findShopItem,
  processPurchase,
} from './shop';

export type {
  MinigameStatus,
  GameBounds,
  BallPhysicsConfig,
  BallState,
  BallGameState,
  MinigameReward,
} from './minigame';

export {
  DEFAULT_BALL_BOUNDS,
  DEFAULT_BALL_CONFIG,
  isPointInsideBall,
  createInitialBallGameState,
  startBallGame,
  updateBallPhysics,
  hitBall,
  calculateCoinReward,
  calculateHappinessReward,
  calculateMinigameReward,
} from './minigame';
