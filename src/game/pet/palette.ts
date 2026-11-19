import type { PetColor } from '../../domain';
import type { FacialFeatureColors, PetColorPalette } from './types';

/**
 * Paleta de colores para cada pelaje disponible de la mascota.
 * Define el tono principal del cuerpo, tono de sombra para profundidad,
 * tono interior para las orejas y tono de contraste para el vientre.
 */
export const PET_COLOR_PALETTES: Readonly<Record<PetColor, PetColorPalette>> = {
  white: {
    primary: 0xFDFEFE,
    shadow: 0xE0E6ED,
    earInner: 0xFFCDD2,
    belly: 0xFFFFFF,
  },
  brown: {
    primary: 0x8D6E63,
    shadow: 0x6D4C41,
    earInner: 0xD7CCC8,
    belly: 0xBCAAA4,
  },
  black: {
    primary: 0x37474F,
    shadow: 0x263238,
    earInner: 0x546E7A,
    belly: 0x455A64,
  },
  pink: {
    primary: 0xF8BBD0,
    shadow: 0xF48FB1,
    earInner: 0xFFE082,
    belly: 0xFCE4EC,
  },
  gray: {
    primary: 0xB0BEC5,
    shadow: 0x78909C,
    earInner: 0xCFD8DC,
    belly: 0xECEFF1,
  },
  orange: {
    primary: 0xFFB74D,
    shadow: 0xF57C00,
    earInner: 0xFFE082,
    belly: 0xFFE0B2,
  },
};

/**
 * Colores constantes para ojos, boca, nariz, rubor y contornos generales.
 */
export const FACIAL_FEATURE_COLORS: FacialFeatureColors = {
  outline: 0x2C3437,
  outlineWidth: 3,
  eyePupil: 0x1A1A1A,
  eyeWhite: 0xFFFFFF,
  eyeHighlight: 0xFFFFFF,
  mouthLine: 0x2C3437,
  mouthInside: 0xEF5350,
  cheeks: 0xFF8A80,
  cheeksAlpha: 0.5,
  nose: 0x37474F,
  starEye: 0xFFD54F,
};

/**
 * Resuelve la paleta de colores para un color de pelaje dado.
 * Si el color no existe, recurre de forma segura a 'white'.
 */
export function getPetColorPalette(color: PetColor): PetColorPalette {
  return PET_COLOR_PALETTES[color] ?? PET_COLOR_PALETTES.white;
}
