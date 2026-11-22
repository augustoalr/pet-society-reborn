/**
 * Lógica pura de simulación física y reglas del minijuego de pelota (malabares).
 *
 * Cumple rigurosamente con:
 * - R-01 (SoC): Dominio puro sin dependencias de UI, DOM o motores gráficos.
 * - R-03 (Inmutabilidad por Defecto): Todas las funciones son puras y retornan
 *   nuevas instancias inmutables.
 * - R-05 (Early Return): Validaciones previas en la cabecera.
 */

import type {
  BallGameState,
  BallPhysicsConfig,
  GameBounds,
  MinigameReward,
} from './types';

/** Límites espaciales por defecto dentro de la resolución virtual fija 800x600. */
export const DEFAULT_BALL_BOUNDS: GameBounds = {
  minX: 30,
  maxX: 770,
  minY: 30,
  maxY: 510, // Nivel del suelo del jardín donde la pelota colisiona y termina la ronda
};

/** Parámetros físicos calibrados para una jugabilidad fluida, flotante y reactiva (T-ART-03). */
export const DEFAULT_BALL_CONFIG: BallPhysicsConfig = {
  radius: 48, // Duplicado de 24px a 48px (~96-100px de diámetro para visibilidad y comodidad táctil)
  gravity: 780, // px/s² de aceleración hacia abajo (arco de parábola más generoso y flotante)
  reboundRestitution: 0.78, // Coeficiente de elasticidad jugoso en paredes laterales y techo
  hitImpulseY: -640, // Impulso vertical hacia arriba por golpe
  maxSpeedX: 420, // Límite horizontal para no perder la pelota de vista
  maxSpeedY: 900, // Velocidad terminal de caída
};

/**
 * Comprueba si un punto (p. ej. coordenadas de toque del puntero) se encuentra
 * dentro del área circular de la pelota, admitiendo un margen de tolerancia adicional.
 */
export function isPointInsideBall(
  ball: { readonly x: number; readonly y: number; readonly radius: number },
  point: { readonly x: number; readonly y: number },
  margin = 0
): boolean {
  const effectiveRadius = ball.radius + Math.max(0, margin);
  const dx = point.x - ball.x;
  const dy = point.y - ball.y;
  return dx * dx + dy * dy <= effectiveRadius * effectiveRadius;
}

/**
 * Crea el estado inicial inmutable para una nueva partida del minijuego de pelota.
 *
 * @param boundsOverride Límites opcionales del escenario.
 * @param highScore Puntuación máxima histórica acumulada.
 * @param configOverride Parámetros físicos personalizados opcionales.
 */
export function createInitialBallGameState(
  boundsOverride?: Partial<GameBounds>,
  highScore = 0,
  configOverride?: Partial<BallPhysicsConfig>
): BallGameState {
  const bounds: GameBounds = {
    ...DEFAULT_BALL_BOUNDS,
    ...boundsOverride,
  };

  const config: BallPhysicsConfig = {
    ...DEFAULT_BALL_CONFIG,
    ...configOverride,
  };

  const initialX = Math.round((bounds.minX + bounds.maxX) / 2);
  const initialY = Math.round(bounds.minY + 220);

  return {
    status: 'idle',
    ball: {
      x: initialX,
      y: initialY,
      vx: 0,
      vy: 0,
      radius: config.radius,
    },
    score: 0,
    combo: 0,
    highScore: Math.max(0, Math.floor(highScore)),
    coinsEarned: 0,
    bounds,
    config,
  };
}

/**
 * Inicia la partida transicionando el estado de 'idle' o 'game_over' a 'playing'.
 */
export function startBallGame(state: BallGameState): BallGameState {
  if (state.status === 'playing') {
    return state;
  }

  return {
    ...state,
    status: 'playing',
    score: 0,
    combo: 0,
    coinsEarned: 0,
    ball: {
      ...state.ball,
      vx: 0,
      vy: -220, // Leve saque suave hacia arriba
    },
  };
}

/**
 * Aplica un paso temporal de integración física (Euler simplificado) al estado de la pelota.
 *
 * - Aplica gravedad continua.
 * - Gestiona rebotes elásticos en paredes laterales y techo.
 * - Detecta contacto con el suelo (fin de partida / Game Over).
 *
 * @param state Estado actual del juego.
 * @param deltaTimeSeconds Tiempo transcurrido en segundos desde el último frame.
 * @param boundsOverride Límites opcionales para la simulación.
 * @returns Nuevo estado inmutable tras la actualización cinemática.
 */
export function updateBallPhysics(
  state: BallGameState,
  deltaTimeSeconds: number,
  boundsOverride?: GameBounds
): BallGameState {
  // Early return si la partida no está en curso o el delta es inválido
  if (state.status !== 'playing') {
    return state;
  }
  if (deltaTimeSeconds <= 0 || !Number.isFinite(deltaTimeSeconds)) {
    return state;
  }

  // Clampeo a 100ms para evitar saltos descomunales (tunneling) por pérdida de foco
  const dt = Math.min(deltaTimeSeconds, 0.1);
  const bounds = boundsOverride ?? state.bounds;
  const { radius, gravity, reboundRestitution, maxSpeedX, maxSpeedY } = state.config;

  // 1. Integración de velocidad con gravedad
  let vx = state.ball.vx;
  let vy = Math.min(state.ball.vy + gravity * dt, maxSpeedY);

  // Clampear velocidad horizontal
  vx = Math.max(-maxSpeedX, Math.min(maxSpeedX, vx));

  // 2. Integración de posición
  let x = state.ball.x + vx * dt;
  let y = state.ball.y + vy * dt;

  // 3. Rebote elástico en pared lateral izquierda
  const leftLimit = bounds.minX + radius;
  if (x <= leftLimit) {
    x = leftLimit;
    vx = Math.abs(vx) * reboundRestitution;
  }

  // 4. Rebote elástico en pared lateral derecha
  const rightLimit = bounds.maxX - radius;
  if (x >= rightLimit) {
    x = rightLimit;
    vx = -Math.abs(vx) * reboundRestitution;
  }

  // 5. Rebote en el techo (parte superior)
  const topLimit = bounds.minY + radius;
  if (y <= topLimit) {
    y = topLimit;
    vy = Math.abs(vy) * reboundRestitution;
  }

  // 6. Colisión con el suelo -> Game Over
  const groundLimit = bounds.maxY - radius;
  if (y >= groundLimit) {
    const finalScore = state.score;
    const coinsEarned = calculateCoinReward(finalScore);
    const newHighScore = Math.max(state.highScore, finalScore);

    return {
      ...state,
      status: 'game_over',
      score: finalScore,
      combo: 0,
      highScore: newHighScore,
      coinsEarned,
      ball: {
        x: Math.max(leftLimit, Math.min(rightLimit, x)),
        y: groundLimit,
        vx: 0,
        vy: 0,
        radius,
      },
    };
  }

  return {
    ...state,
    ball: {
      x,
      y,
      vx,
      vy,
      radius,
    },
  };
}

/**
 * Ejecuta un golpe o toque sobre la pelota.
 *
 * - Si el juego está en 'idle', el primer golpe inicia la partida de forma inmediata.
 * - Si el juego está en 'game_over', no tiene efecto (requiere reinicio).
 * - Si se proporciona `hitPosition`, comprueba si el impacto ocurrió dentro de la pelota
 *   y modula la velocidad horizontal $vx$ según el desfase respecto al centro:
 *   un toque a la izquierda impulsa la pelota hacia la derecha, y viceversa.
 *
 * @param state Estado actual de la partida.
 * @param hitPosition Coordenadas virtuales opcionales donde el puntero impactó.
 * @param hitMargin Margen de tolerancia para facilitar toques táctiles móviles.
 * @returns Nuevo estado inmutable con impulso aplicado y combo incrementado.
 */
export function hitBall(
  state: BallGameState,
  hitPosition?: { readonly x: number; readonly y: number },
  hitMargin = 20
): BallGameState {
  // Early return si la partida ya terminó
  if (state.status === 'game_over') {
    return state;
  }

  // Si se indican coordenadas y el punto está fuera del radio de impacto, se considera fallo
  if (hitPosition && !isPointInsideBall(state.ball, hitPosition, hitMargin)) {
    return state;
  }

  let newVx = state.ball.vx * 0.7;

  if (hitPosition) {
    // Desfase horizontal: positivo si se golpeó a la izquierda del centro
    const deltaX = state.ball.x - hitPosition.x;
    const normalizedOffset = Math.max(-1, Math.min(1, deltaX / state.ball.radius));
    // Modulación horizontal suave combinando la inercia previa con el nuevo impulso
    newVx = (state.ball.vx * 0.35) + normalizedOffset * 340;
    newVx = Math.max(-state.config.maxSpeedX, Math.min(state.config.maxSpeedX, newVx));
  }

  const newScore = state.score + 1;
  const newCombo = state.combo + 1;
  const newHighScore = Math.max(state.highScore, newScore);

  return {
    ...state,
    status: 'playing',
    score: newScore,
    combo: newCombo,
    highScore: newHighScore,
    lastHitTimestamp: Date.now(),
    ball: {
      ...state.ball,
      vx: newVx,
      vy: state.config.hitImpulseY,
    },
  };
}

/**
 * Calcula la recompensa en monedas en función de la puntuación obtenida en toques.
 *
 * Fórmula:
 * - 2 monedas por toque base.
 * - Bono de combo de 5 monedas adicionales por cada 5 toques acumulados.
 *
 * @param score Puntuación o toques conseguidos.
 * @returns Monedas a acreditar (mínimo 0).
 */
export function calculateCoinReward(score: number): number {
  if (score <= 0 || !Number.isFinite(score)) {
    return 0;
  }
  const cleanScore = Math.floor(score);
  const baseCoins = cleanScore * 2;
  const comboBonus = Math.floor(cleanScore / 5) * 5;
  return baseCoins + comboBonus;
}

/**
 * Calcula el incremento de felicidad otorgado a la mascota tras una ronda de juego.
 *
 * Fórmula:
 * - Mínimo 5 puntos si se logró al menos 1 toque.
 * - +2 puntos por toque adicional.
 * - Máximo 50 puntos de incremento.
 *
 * @param score Puntuación conseguida.
 * @returns Puntos de felicidad a incrementar (entre 0 y 50).
 */
export function calculateHappinessReward(score: number): number {
  if (score <= 0 || !Number.isFinite(score)) {
    return 0;
  }
  const cleanScore = Math.floor(score);
  return Math.min(50, Math.max(5, cleanScore * 2));
}

/**
 * Calcula el paquete completo de recompensas (monedas y felicidad) para la partida.
 */
export function calculateMinigameReward(score: number): MinigameReward {
  return {
    coins: calculateCoinReward(score),
    happiness: calculateHappinessReward(score),
  };
}
