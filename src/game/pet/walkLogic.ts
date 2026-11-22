/**
 * Lógica pura para el desplazamiento y ciclo de animación de caminar de la mascota (R-01: SoC).
 *
 * Responsabilidades:
 * - Validar puntos de clic dentro de la zona de suelo transitable de la habitación.
 * - Determinar la orientación horizontal (facing direction) al desplazarse.
 * - Calcular pasos de movimiento a velocidad constante hacia el objetivo.
 * - Generar desplazamientos periódicos (offsets) para balanceo y patitas alternas.
 */

import { clampToBounds, type Bounds } from '../../domain';

/**
 * Límites transitables para el centro de la mascota en el suelo de la habitación (800x600).
 * Deja márgenes de seguridad para que la cabeza, brazos y sombra no se salgan del encuadre.
 */
export const PET_WALK_BOUNDS: Bounds = {
  minX: 80,
  maxX: 720,
  minY: 340,
  maxY: 520,
};

/** Altura mínima Y donde comienza el suelo de parquet en la habitación. */
export const FLOOR_SURFACE_Y = 330;

/**
 * Comprueba si unas coordenadas dadas corresponden a la superficie del suelo de la habitación.
 *
 * @param pos Coordenadas en el espacio virtual (800x600).
 */
export function isFloorPosition(pos: { x: number; y: number }): boolean {
  if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
    return false;
  }
  return pos.y >= FLOOR_SURFACE_Y && pos.y <= 600 && pos.x >= 0 && pos.x <= 800;
}

/**
 * Acota las coordenadas de destino a los límites seguros transitables de la mascota.
 *
 * @param pos Coordenadas objetivo deseadas.
 * @param bounds Límites transitables (por defecto `PET_WALK_BOUNDS`).
 */
export function clampToFloor(
  pos: { x: number; y: number },
  bounds: Bounds = PET_WALK_BOUNDS
): { x: number; y: number } {
  return clampToBounds(pos, bounds);
}

/**
 * Determina la dirección horizontal hacia la cual debe mirar la mascota.
 * Retorna 1 para la derecha y -1 para la izquierda.
 *
 * @param currentX Posición X actual.
 * @param targetX Posición X objetivo.
 * @param currentFacing Dirección actual (1 o -1).
 * @param threshold Umbral de holgura en píxeles para evitar parpadeos de flip.
 */
export function determineFacingDirection(
  currentX: number,
  targetX: number,
  currentFacing: 1 | -1 = 1,
  threshold = 2
): 1 | -1 {
  const diff = targetX - currentX;
  if (diff > threshold) {
    return 1;
  }
  if (diff < -threshold) {
    return -1;
  }
  return currentFacing;
}

export interface WalkStepResult {
  readonly currentPos: { readonly x: number; readonly y: number };
  readonly arrived: boolean;
}

/**
 * Calcula la nueva posición de la mascota avanzando hacia el objetivo a velocidad constante.
 *
 * @param currentPos Posición actual (x, y).
 * @param targetPos Posición objetivo (x, y).
 * @param speed Velocidad en píxeles por segundo.
 * @param deltaSeconds Tiempo transcurrido en segundos.
 */
export function calculateWalkStep(
  currentPos: { x: number; y: number },
  targetPos: { x: number; y: number },
  speed: number,
  deltaSeconds: number
): WalkStepResult {
  const dx = targetPos.x - currentPos.x;
  const dy = targetPos.y - currentPos.y;
  const distance = Math.hypot(dx, dy);

  const stepDistance = speed * deltaSeconds;

  // Si el paso cubre o supera la distancia restante, llegamos exactamente al destino
  if (distance <= stepDistance || distance < 0.5) {
    return {
      currentPos: { x: targetPos.x, y: targetPos.y },
      arrived: true,
    };
  }

  const factor = stepDistance / distance;
  return {
    currentPos: {
      x: currentPos.x + dx * factor,
      y: currentPos.y + dy * factor,
    },
    arrived: false,
  };
}

export interface WalkAnimationOffsets {
  /** Inclinación sutil de balanceo lateral (waddle tilt) en radianes. */
  readonly waddleTilt: number;
  /** Rebote vertical suave de todo el torso y cabeza en píxeles. */
  readonly bounceY: number;
  /** Desplazamiento vertical de la pata izquierda en píxeles. */
  readonly leftFootY: number;
  /** Desplazamiento vertical de la pata derecha en píxeles. */
  readonly rightFootY: number;
  /** Desplazamiento vertical del brazo izquierdo. */
  readonly leftArmY: number;
  /** Desplazamiento vertical del brazo derecho. */
  readonly rightArmY: number;
  /** Factor de escala de la sombra en el suelo al despegar los pies. */
  readonly shadowScaleX: number;
}

/**
 * Calcula los offsets de balanceo, rebote y patitas alternadas según el tiempo de caminata.
 *
 * @param walkTimer Tiempo o fase de caminata acumulada.
 */
export function calculateWalkAnimationOffsets(walkTimer: number): WalkAnimationOffsets {
  // Balanceo lateral (waddle)
  const waddleTilt = Math.sin(walkTimer) * 0.055;

  // Rebote vertical hacia arriba durante cada zancada
  const bounceY = -Math.abs(Math.sin(walkTimer)) * 4.5;

  // Patas en contrafase (diferencia de pi radianes = 180 grados)
  const leftFootY = Math.sin(walkTimer) * 6;
  const rightFootY = Math.sin(walkTimer + Math.PI) * 6;

  // Brazos balanceándose en sincronía opuesta para sensación natural
  const leftArmY = Math.sin(walkTimer + Math.PI) * 2.5;
  const rightArmY = Math.sin(walkTimer) * 2.5;

  // La sombra en el suelo se contrae sutilmente cuando la mascota rebota hacia arriba
  const shadowScaleX = 1 - Math.abs(bounceY) * 0.02;

  return {
    waddleTilt,
    bounceY,
    leftFootY,
    rightFootY,
    leftArmY,
    rightArmY,
    shadowScaleX,
  };
}
