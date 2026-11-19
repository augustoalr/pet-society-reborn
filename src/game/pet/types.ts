/**
 * Orden estricto de capas de renderizado de la mascota (Layer Order).
 *
 * 1. Orejas traseras (si aplica según estilo).
 * 2. Cuerpo / torso y extremidades base.
 * 3. Cabeza.
 * 4. Orejas delanteras.
 * 5. Ojos (round, sleepy, happy, star).
 * 6. Boca (smile, open, neutral) y mejillas.
 * 7. Capas de ropa (camisa, sombrero, accesorios).
 */
export const PET_LAYER_ORDER = {
  BACK_EARS: 0,
  BODY: 1,
  HEAD: 2,
  FRONT_EARS: 3,
  EYES: 4,
  MOUTH_AND_CHEEKS: 5,
  CLOTHES: 6,
} as const;

export type PetLayerOrderKey = keyof typeof PET_LAYER_ORDER;
export type PetLayerIndex = (typeof PET_LAYER_ORDER)[PetLayerOrderKey];

/** Nombres canónicos de las capas en orden de renderizado. */
export const PET_LAYER_NAMES: readonly string[] = [
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
