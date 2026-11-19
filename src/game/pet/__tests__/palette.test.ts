import { describe, expect, it } from 'vitest';
import type { PetColor } from '../../../domain';
import {
  FACIAL_FEATURE_COLORS,
  PET_COLOR_PALETTES,
  getPetColorPalette,
} from '../palette';

describe('Pet Palette', () => {
  const allColors: readonly PetColor[] = [
    'white',
    'brown',
    'black',
    'pink',
    'gray',
    'orange',
  ];

  it('define paleta para todos los colores de pelaje válidos', () => {
    for (const color of allColors) {
      const palette = PET_COLOR_PALETTES[color];
      expect(palette).toBeDefined();
      expect(typeof palette.primary).toBe('number');
      expect(typeof palette.shadow).toBe('number');
      expect(typeof palette.earInner).toBe('number');
      expect(typeof palette.belly).toBe('number');

      // Validar que son valores numéricos hexadecimales válidos de 24 bits
      expect(palette.primary).toBeGreaterThanOrEqual(0);
      expect(palette.primary).toBeLessThanOrEqual(0xFFFFFF);
      expect(palette.shadow).toBeGreaterThanOrEqual(0);
      expect(palette.shadow).toBeLessThanOrEqual(0xFFFFFF);
    }
  });

  it('getPetColorPalette retorna la paleta correcta para cada color', () => {
    for (const color of allColors) {
      expect(getPetColorPalette(color)).toBe(PET_COLOR_PALETTES[color]);
    }
  });

  it('getPetColorPalette recurre a white ante un color desconocido', () => {
    const fallback = getPetColorPalette('unknown' as unknown as PetColor);
    expect(fallback).toBe(PET_COLOR_PALETTES.white);
  });

  it('FACIAL_FEATURE_COLORS contiene valores numéricos válidos', () => {
    expect(typeof FACIAL_FEATURE_COLORS.outline).toBe('number');
    expect(typeof FACIAL_FEATURE_COLORS.outlineWidth).toBe('number');
    expect(FACIAL_FEATURE_COLORS.outlineWidth).toBeGreaterThan(0);
    expect(typeof FACIAL_FEATURE_COLORS.eyePupil).toBe('number');
    expect(typeof FACIAL_FEATURE_COLORS.eyeWhite).toBe('number');
    expect(typeof FACIAL_FEATURE_COLORS.mouthLine).toBe('number');
    expect(typeof FACIAL_FEATURE_COLORS.mouthInside).toBe('number');
    expect(typeof FACIAL_FEATURE_COLORS.cheeks).toBe('number');
    expect(FACIAL_FEATURE_COLORS.cheeksAlpha).toBeGreaterThan(0);
    expect(FACIAL_FEATURE_COLORS.cheeksAlpha).toBeLessThanOrEqual(1);
  });
});
