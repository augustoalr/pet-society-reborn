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

export type { Wallet } from './economy';
export type { InventoryItem, Inventory, ItemCategory } from './inventory';
export type { Room, PlacedItem } from './room';
export type { GameState } from './game';
export { createDefaultGameState } from './game';
