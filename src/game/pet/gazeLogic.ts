/**
 * Lógica pura para la mirada reactiva al puntero y el ciclo natural de parpadeo (R-01: SoC).
 *
 * Responsabilidades:
 * - Calcular la orientación y desplazamiento 2D de las pupilas según la posición del cursor en pantalla.
 * - Respetar la orientación horizontal (flip) de la mascota para que siempre mire coherentemente.
 * - Acotar el radio de desplazamiento ocular para mantener proporciones anatómicas naturales de estilo Chibi.
 * - Gestionar el estado y curva temporal de parpadeo con intervalos aleatorios entre 3 y 5 segundos.
 */

export interface BlinkState {
  /** Segundos restantes hasta que se inicie el próximo parpadeo. */
  timeUntilNextBlink: number;
  /** Indica si los párpados se encuentran en movimiento activo (cerrando o abriendo). */
  isBlinking: boolean;
  /** Segundos transcurridos en el parpadeo actual. */
  blinkElapsed: number;
  /** Duración total del parpadeo en segundos (~0.14s - 0.18s). */
  blinkDuration: number;
}

export interface CalculatePupilOffsetOptions {
  /** Desplazamiento del centro de los ojos relativo al origen de la mascota. */
  readonly eyeCenterOffset?: { readonly x: number; readonly y: number };
  /** Radio máximo de desplazamiento de la pupila en píxeles. */
  readonly maxRadius?: number;
  /** Distancia en píxeles a partir de la cual se alcanza el radio máximo. */
  readonly distanceRange?: number;
}

/**
 * Crea un estado inicial de parpadeo con un temporizador aleatorio entre 3 y 5 segundos.
 *
 * @param randomFn Generador de números pseudoaleatorios (por defecto `Math.random`).
 */
export function createBlinkState(randomFn: () => number = Math.random): BlinkState {
  return {
    timeUntilNextBlink: 3 + randomFn() * 2,
    isBlinking: false,
    blinkElapsed: 0,
    blinkDuration: 0.16,
  };
}

/**
 * Actualiza el temporizador de parpadeo y retorna el progreso normalizado (0 = abierto, 1 = cerrado).
 *
 * @param state Estado actual inmutable de parpadeo.
 * @param deltaSeconds Tiempo transcurrido en segundos.
 * @param randomFn Generador de números pseudoaleatorios.
 */
export function updateBlinkState(
  state: BlinkState,
  deltaSeconds: number,
  randomFn: () => number = Math.random
): { state: BlinkState; blinkProgress: number } {
  let { timeUntilNextBlink, isBlinking, blinkElapsed, blinkDuration } = state;

  if (!isBlinking) {
    timeUntilNextBlink -= deltaSeconds;
    if (timeUntilNextBlink <= 0) {
      isBlinking = true;
      blinkElapsed = 0;
      blinkDuration = 0.14 + randomFn() * 0.04;
    }
    return {
      state: { timeUntilNextBlink, isBlinking, blinkElapsed, blinkDuration },
      blinkProgress: 0,
    };
  }

  blinkElapsed += deltaSeconds;
  if (blinkElapsed >= blinkDuration) {
    return {
      state: {
        timeUntilNextBlink: 3 + randomFn() * 2,
        isBlinking: false,
        blinkElapsed: 0,
        blinkDuration,
      },
      blinkProgress: 0,
    };
  }

  // Curva senoidal suave: 0 en inicio, 1 en el punto medio, 0 al finalizar
  const t = blinkElapsed / blinkDuration;
  const blinkProgress = Math.sin(t * Math.PI);

  return {
    state: { timeUntilNextBlink, isBlinking, blinkElapsed, blinkDuration },
    blinkProgress,
  };
}

/**
 * Calcula el desplazamiento 2D de las pupilas hacia las coordenadas mundiales del cursor.
 *
 * @param petWorldPos Posición mundial actual de la mascota en el lienzo virtual (800x600).
 * @param petScaleX Escala horizontal de la mascota (1 para mirar a la derecha, -1 para mirar a la izquierda).
 * @param cursorWorldPos Posición del cursor en el lienzo virtual o null si está inactivo/fuera.
 * @param options Parámetros de acotamiento y calibración ocular.
 * @returns Coordenadas locales (x, y) de desplazamiento de la pupila.
 */
export function calculatePupilOffset(
  petWorldPos: { x: number; y: number },
  petScaleX: number,
  cursorWorldPos: { x: number; y: number } | null,
  options: CalculatePupilOffsetOptions = {}
): { x: number; y: number } {
  if (!cursorWorldPos) {
    return { x: 0, y: 0 };
  }

  const eyeOffset = options.eyeCenterOffset ?? { x: 0, y: -26 };
  const maxRadius = options.maxRadius ?? 4.0;
  const distanceRange = options.distanceRange ?? 60;

  // Centro mundial de la mirada de la mascota teniendo en cuenta su escala horizontal
  const eyeWorldX = petWorldPos.x + eyeOffset.x * petScaleX;
  const eyeWorldY = petWorldPos.y + eyeOffset.y;

  const dx = cursorWorldPos.x - eyeWorldX;
  const dy = cursorWorldPos.y - eyeWorldY;
  const distance = Math.hypot(dx, dy);

  if (distance < 1) {
    return { x: 0, y: 0 };
  }

  // Radio adaptativo suave proporcional a la distancia del cursor
  const radius = Math.min(maxRadius, (distance / distanceRange) * maxRadius);
  const angle = Math.atan2(dy, dx);

  // Inversión del eje X local si el contenedor de la mascota tiene flip horizontal
  const localDirX = petScaleX < 0 ? -1 : 1;

  const localX = Math.cos(angle) * radius * localDirX;
  const localY = Math.sin(angle) * radius;

  return {
    x: Number.isFinite(localX) ? localX : 0,
    y: Number.isFinite(localY) ? localY : 0,
  };
}
