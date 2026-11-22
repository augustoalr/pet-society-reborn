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
  drawShadow,
} from '../layerDrawers';
import { getPetColorPalette } from '../palette';

describe('Layer Drawers', () => {
  const palette = getPetColorPalette('pink');

  it('drawShadow dibuja la sombra elíptica difuminada sin errores', () => {
    const g = new Graphics();
    expect(() => drawShadow(g)).not.toThrow();
  });

  it('drawBackEars dibuja orejas round y pointy sin errores', () => {
    const g = new Graphics();
    expect(() => drawBackEars(g, 'round', palette)).not.toThrow();
    expect(() => drawBackEars(g, 'pointy', palette)).not.toThrow();
    expect(() => drawBackEars(g, 'floppy', palette)).not.toThrow();
  });

  it('drawBody dibuja torso y extremidades sin errores (con y sin offsets de caminata)', () => {
    const g = new Graphics();
    expect(() => drawBody(g, palette)).not.toThrow();
    expect(() =>
      drawBody(g, palette, {
        leftFootY: 4,
        rightFootY: -4,
        leftArmY: -2,
        rightArmY: 2,
      })
    ).not.toThrow();
  });

  it('drawHead dibuja la cabeza Chibi con brillos Flash sin errores', () => {
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

  it('drawEyes soporta todos los estilos de ojos, mirada reactiva y parpadeo sin errores', () => {
    const g = new Graphics();
    const eyeStyles: EyeStyle[] = ['round', 'sleepy', 'happy', 'star'];
    for (const style of eyeStyles) {
      // Reposo neutral
      expect(() => drawEyes(g, style, palette)).not.toThrow();

      // Con mirada reactiva hacia el cursor
      expect(() =>
        drawEyes(g, style, palette, {
          pupilOffset: { x: 3.5, y: -2 },
          blinkProgress: 0,
        })
      ).not.toThrow();

      // En fase de parpadeo intermedio (párpados cerrándose)
      expect(() =>
        drawEyes(g, style, palette, {
          pupilOffset: { x: 0, y: 0 },
          blinkProgress: 0.5,
        })
      ).not.toThrow();

      // En fase de ojo totalmente cerrado (pestañas cerradas)
      expect(() =>
        drawEyes(g, style, palette, {
          pupilOffset: { x: 0, y: 0 },
          blinkProgress: 0.95,
        })
      ).not.toThrow();
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
