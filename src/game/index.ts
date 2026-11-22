export { PixiGameEngine } from './engine';
export type { GamePointerEvent, GamePointerEventType, GamePointerEventHandler } from './engine';

export {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  VIRTUAL_ASPECT_RATIO,
  calculateViewportScale,
} from './viewport';
export type { ViewportScaleResult } from './viewport';

export {
  PetView,
  PET_COLOR_PALETTES,
  FACIAL_FEATURE_COLORS,
  getPetColorPalette,
  PET_LAYER_ORDER,
  PET_LAYER_NAMES,
  drawShadow,
  PET_WALK_BOUNDS,
  FLOOR_SURFACE_Y,
  isFloorPosition,
  clampToFloor,
} from './pet';
export type {
  PetLayerOrderKey,
  PetLayerIndex,
  PetColorPalette,
  FacialFeatureColors,
  DrawEyeOptions,
  DrawBodyOptions,
  BlinkState,
  WalkStepResult,
  WalkAnimationOffsets,
} from './pet';

export {
  RoomView,
  FurnitureView,
  BASE_FURNITURE_CATALOG,
  getFurnitureDefinition,
  drawBed,
  drawTable,
  drawLamp,
  drawPlant,
  drawFurnitureGraphics,
} from './room';
export type { RoomLayoutConfig, FurnitureDefinition, FurnitureMovedEvent } from './room';

export { BallGameView } from './minigame';
export type { BallGameViewOptions } from './minigame';
