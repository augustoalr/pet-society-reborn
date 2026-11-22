export { RoomView } from './RoomView';
export { FurnitureView } from './FurnitureView';
export {
  BASE_FURNITURE_CATALOG,
  BASE_WALL_CATALOG,
  getFurnitureDefinition,
} from './furnitureCatalog';
export {
  drawFurnitureShadow,
  drawBed,
  drawTable,
  drawLamp,
  drawPlant,
  drawPainting,
  drawClock,
  drawWallWindow,
  drawFallbackFurniture,
  drawFurnitureGraphics,
} from './furnitureDrawers';
export type { RoomLayoutConfig, FurnitureDefinition, FurnitureMovedEvent } from './types';
