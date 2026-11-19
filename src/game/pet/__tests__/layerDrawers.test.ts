import { describe, expect, it } from 'vitest';
import { Graphics } from 'pixi.js';
import type { EarStyle, EyeStyle, MouthStyle } from '../../../domain';
import {
  drawBackEars,
  drawBody,
  drawClothes,
  drawEyes,
  drawFrontEars,
  drawHead,
  drawMouthAndCheeks,
} from '../layerDrawers';
import { getPetColorPalette } from '../palette';

describe('Layer Drawers', () => {
  const palette = getPetColorPalette('pink');

  it('drawBackEars dibuja orejas round y pointy sin errores', () => {
    const g = new Graphics();
    expect(() => drawBackEars(g, 'round', palette)).not.toThrow();
    expect(() => drawBackEars(g, 'pointy', palette)).not.toThrow();
    expect(() => drawBackEars(g, 'floppy', palette)).not.toThrow();
  });

  it('drawBody dibuja torso y extremidades sin errores', () => {
    const g = new Graphics();
    expect(() => drawBody(g, palette)).not.toThrow();
  });

  it('drawHead dibuja la cabeza sin errores', () => {
    const g = new Graphics();
    expect(() => drawHead(g, palette)).not.toThrow();
  });

  it('drawFrontEars dibuja orejas floppy sin errores', () => {
    const g = new Graphics();
    const earStyles: EarStyle[] = ['floppy', 'pointy', 'round'];
    for (const style of earStyles) {
      expect(() => drawFrontEars(g, style, palette)).not.toThrow();
    }
  });

  it('drawEyes soporta todos los estilos de ojos sin errores', () => {
    const g = new Graphics();
    const eyeStyles: EyeStyle[] = ['round', 'sleepy', 'happy', 'star'];
    for (const style of eyeStyles) {
      expect(() => drawEyes(g, style, palette)).not.toThrow();
    }
  });

  it('drawMouthAndCheeks soporta todos los estilos de boca sin errores', () => {
    const g = new Graphics();
    const mouthStyles: MouthStyle[] = ['smile', 'open', 'neutral'];
    for (const style of mouthStyles) {
      expect(() => drawMouthAndCheeks(g, style)).not.toThrow();
    }
  });

  it('drawClothes maneja prendas vacías y prendas válidas sin errores', () => {
    const g = new Graphics();
    expect(() => drawClothes(g, undefined)).not.toThrow();
    expect(() => drawClothes(g, {})).not.toThrow();
    expect(() =>
      drawClothes(g, {
        hat: 'party-hat',
        shirt: 'red-shirt',
        accessory: 'bowtie',
      })
    ).not.toThrow();
    expect(() =>
      drawClothes(g, {
        hat: 'cap',
        shirt: 'blue-shirt',
        accessory: 'glasses',
      })
    ).not.toThrow();
  });
});
