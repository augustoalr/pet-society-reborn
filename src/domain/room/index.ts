export type { Room, PlacedItem, Bounds } from './types';
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
} from './roomLogic';
