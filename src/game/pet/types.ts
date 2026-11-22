/**
 * Orden estricto de capas de renderizado de la mascota (Layer Order).
 *
 * 0. Sombra elíptica difuminada de anclaje al suelo.
 * 1. Orejas traseras (si aplica según estilo).
 * 2. Cuerpo / torso y extremidades base.
 * 3. Cabeza.
 * 4. Orejas delanteras.
 * 5. Ojos (round, sleepy, happy, star) con soporte de mirada reactiva y parpadeo.
 * 6. Boca (smile, open, neutral) y mejillas sonrosadas.
 * 7. Capas de ropa (camisa, sombrero, accesorios).
 */
export const PET_LAYER_ORDER = {
  SHADOW: 0,
  BACK_EARS: 1,
  BODY: 2,
  HEAD: 3,
  FRONT_EARS: 4,
  EYES: 5,
  MOUTH_AND_CHEEKS: 6,
  CLOTHES: 7,
} as const;

export type PetLayerOrderKey = keyof typeof PET_LAYER_ORDER;
export type PetLayerIndex = (typeof PET_LAYER_ORDER)[PetLayerOrderKey];

/** Nombres canónicos de las capas en orden de renderizado. */
export const PET_LAYER_NAMES: readonly string[] = [
  'shadow',
  'back_ears',
  'body',
  'head',
  'front_ears',
  'eyes',
  'mouth_and_cheeks',
  'clothes',
] as const;

/**
 * Paleta de colores primarios y secundarios para un color de pelaje.
 */
export interface PetColorPalette {
  readonly primary: number;
  readonly shadow: number;
  readonly earInner: number;
  readonly belly: number;
}

/**
 * Colores constantes para rasgos faciales y detalles anatómicos.
 */
export interface FacialFeatureColors {
  readonly outline: number;
  readonly outlineWidth: number;
  readonly eyePupil: number;
  readonly eyeWhite: number;
  readonly eyeHighlight: number;
  readonly mouthLine: number;
  readonly mouthInside: number;
  readonly cheeks: number;
  readonly cheeksAlpha: number;
  readonly nose: number;
  readonly starEye: number;
}

/**
 * Opciones dinámicas para el renderizado de los ojos.
 */
export interface DrawEyeOptions {
  /** Desplazamiento local de las pupilas hacia el punto de mira (en píxeles locales). */
  readonly pupilOffset?: { readonly x: number; readonly y: number };
  /** Progreso del parpadeo: 0 = ojo abierto, 1 = párpado totalmente cerrado. */
  readonly blinkProgress?: number;
}

/**
 * Opciones dinámicas para el renderizado del cuerpo y extremidades (animación de caminar).
 */
export interface DrawBodyOptions {
  readonly leftFootY?: number;
  readonly rightFootY?: number;
  readonly leftArmY?: number;
  readonly rightArmY?: number;
}
