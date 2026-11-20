import type { PetAppearance, PetClothes, BallGameState } from '../../domain';

/**
 * Opciones de inicialización para la vista PixiJS del minijuego de pelota.
 */
export interface BallGameViewOptions {
  /** Configuración visual de la mascota que cheering/observa en el jardín. */
  readonly appearance?: PetAppearance;
  /** Ropa y accesorios opcionales de la mascota. */
  readonly clothes?: PetClothes | readonly string[];
  /** Puntuación máxima inicial de la sesión. */
  readonly highScore?: number;
  /** Callback al cambiar la puntuación o el combo durante la partida. */
  readonly onScoreChange?: (score: number, combo: number) => void;
  /** Callback al finalizar la partida cuando la pelota toca el suelo. */
  readonly onGameOver?: (finalScore: number, coinsEarned: number) => void;
  /** Callback opcional al asestar un golpe con éxito. */
  readonly onHitSuccess?: (combo: number) => void;
  /** Callback de actualización de estado general. */
  readonly onStateChange?: (state: BallGameState) => void;
}
