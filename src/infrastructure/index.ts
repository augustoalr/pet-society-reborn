export type { IStorageService } from './storage';
export { LocalStorageAdapter, GameStateRepository, GAME_STATE_KEY } from './storage';
export { usePetCare } from './hooks';
export type { UsePetCareOptions, UsePetCareResult } from './hooks';
export type { ISoundService, SoundEffectType, SoundEffectsServiceOptions } from './audio';
export {
  SoundEffectsService,
  soundService,
  STORAGE_KEY_AUDIO_MUTED,
  STORAGE_KEY_AUDIO_VOLUME,
} from './audio';
