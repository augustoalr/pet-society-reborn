/**
 * Tipos e interfaces de dominio para el minijuego de pelota (malabares).
 *
 * Cumple con R-01 (SoC: Dominio puro sin dependencias externas) y
 * R-03 (Inmutabilidad por defecto).
 */

/** Estados posibles de una partida del minijuego. */
export type MinigameStatus = 'idle' | 'playing' | 'game_over';

/** Límites espaciales rectangulares del minijuego en coordenadas virtuales (800x600). */
export interface GameBounds {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

/** Parámetros físicos configurables para la simulación de la pelota. */
export interface BallPhysicsConfig {
  /** Radio de la pelota en píxeles virtuales. */
  readonly radius: number;
  /** Aceleración de gravedad en px/s² hacia abajo. */
  readonly gravity: number;
  /** Coeficiente de restitución (0 a 1) para rebotes en paredes y techo. */
  readonly reboundRestitution: number;
  /** Impulso de velocidad vertical hacia arriba (valor negativo en px/s) al golpear. */
  readonly hitImpulseY: number;
  /** Límite de velocidad horizontal en px/s. */
  readonly maxSpeedX: number;
  /** Límite de velocidad vertical terminal en px/s. */
  readonly maxSpeedY: number;
}

/** Estado cinemático e inmutable de la pelota deportiva. */
export interface BallState {
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly radius: number;
}

/** Estado completo e inmutable del minijuego de pelota. */
export interface BallGameState {
  /** Estado actual del flujo de la partida. */
  readonly status: MinigameStatus;
  /** Posición y velocidad de la pelota. */
  readonly ball: BallState;
  /** Puntuación actual (número de toques consecutivos en la ronda activa). */
  readonly score: number;
  /** Racha o combo consecutivo de toques. */
  readonly combo: number;
  /** Puntuación máxima lograda durante la sesión. */
  readonly highScore: number;
  /** Monedas ganadas en la ronda actual tras el cálculo de recompensa. */
  readonly coinsEarned: number;
  /** Límites de la zona de juego para colisiones y suelo. */
  readonly bounds: GameBounds;
  /** Configuración física activa. */
  readonly config: BallPhysicsConfig;
  /** Marca de tiempo opcional del último golpe registrado. */
  readonly lastHitTimestamp?: number;
}

/** Recompensa calculada al finalizar la partida del minijuego. */
export interface MinigameReward {
  readonly coins: number;
  readonly happiness: number;
}
