import type { PetColor } from '../../domain';
import type { FacialFeatureColors, PetColorPalette } from './types';

/**
 * Paleta de colores para cada pelaje disponible de la mascota.
 * Define el tono principal del cuerpo, tono de sombra para profundidad,
 * tono interior para las orejas y tono de contraste para el vientre.
 */
export const PET_COLOR_PALETTES: Readonly<Record<PetColor, PetColorPalette>> = {
  white: {
    primary: 0xfdfefe,
    shadow: 0xdde4ec,
    earInner: 0xffcdd2,
    belly: 0xffffff,
  },
  brown: {
    primary: 0x8d6e63,
    shadow: 0x6d4c41,
    earInner: 0xd7ccc8,
    belly: 0xbcaaa4,
  },
  black: {
    primary: 0x37474f,
    shadow: 0x263238,
    earInner: 0x546e7a,
    belly: 0x455a64,
  },
  pink: {
    primary: 0xf8bbd0,
    shadow: 0xf48fb1,
    earInner: 0xffe082,
    belly: 0xfce4ec,
  },
  gray: {
    primary: 0xb0bec5,
    shadow: 0x78909c,
    earInner: 0xcfd8dc,
    belly: 0xeceff1,
  },
  orange: {
    primary: 0xffb74d,
    shadow: 0xf57c00,
    earInner: 0xffe082,
    belly: 0xffe0b2,
  },
};

/**
 * Colores constantes para ojos, boca, nariz, rubor y contornos oscuros estilo Flash.
 */
export const FACIAL_FEATURE_COLORS: FacialFeatureColors = {
  outline: 0x24282b,
  outlineWidth: 3.5,
  eyePupil: 0x1a1c1e,
  eyeWhite: 0xffffff,
  eyeHighlight: 0xffffff,
  mouthLine: 0x24282b,
  mouthInside: 0xef5350,
  cheeks: 0xff8a80,
  cheeksAlpha: 0.55,
  nose: 0x32383e,
  starEye: 0xffd54f,
};

/**
 * Resuelve la paleta de colores para un color de pelaje dado.
 * Si el color no existe, recurre de forma segura a 'white'.
 */
export function getPetColorPalette(color: PetColor): PetColorPalette {
  return PET_COLOR_PALETTES[color] ?? PET_COLOR_PALETTES.white;
}
