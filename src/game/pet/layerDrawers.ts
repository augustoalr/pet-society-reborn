import { Graphics } from 'pixi.js';
import type { EarStyle, EyeStyle, MouthStyle, PetClothes } from '../../domain';
import { FACIAL_FEATURE_COLORS } from './palette';
import type { PetColorPalette } from './types';

/**
 * Dibuja las orejas traseras (Capa 1).
 * Para orejas 'round' o 'pointy' se dibujan detrás de la cabeza para
 * lograr una silueta limpia donde la cabeza redondeada se sobrepone.
 * Para orejas 'floppy' no se dibuja nada en esta capa (van en la Capa 4: delanteras).
 */
export function drawBackEars(
  graphics: Graphics,
  ears: EarStyle,
  palette: PetColorPalette
): void {
  graphics.clear();

  if (ears === 'round') {
    // Oreja izquierda
    graphics
      .circle(-46, -62, 22)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.circle(-46, -62, 13).fill({ color: palette.earInner });

    // Oreja derecha
    graphics
      .circle(46, -62, 22)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.circle(46, -62, 13).fill({ color: palette.earInner });
  } else if (ears === 'pointy') {
    // Oreja puntiaguda izquierda
    graphics
      .poly([-58, -30, -50, -78, -24, -50])
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.poly([-53, -36, -48, -70, -30, -50]).fill({ color: palette.earInner });

    // Oreja puntiaguda derecha
    graphics
      .poly([24, -50, 50, -78, 58, -30])
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.poly([30, -50, 48, -70, 53, -36]).fill({ color: palette.earInner });
  }
}

/**
 * Dibuja el cuerpo, vientre y extremidades (Capa 2).
 */
export function drawBody(graphics: Graphics, palette: PetColorPalette): void {
  graphics.clear();

  // Patas inferiores
  graphics
    .ellipse(-28, 68, 14, 11)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
  graphics
    .ellipse(28, 68, 14, 11)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });

  // Torso
  graphics
    .ellipse(0, 36, 42, 34)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });

  // Parche del vientre (contraste más claro)
  graphics.ellipse(0, 38, 26, 22).fill({ color: palette.belly });

  // Brazos / patitas delanteras
  graphics
    .ellipse(-38, 36, 11, 15)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
  graphics
    .ellipse(38, 36, 11, 15)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
}

/**
 * Dibuja la base de la cabeza (Capa 3).
 */
export function drawHead(graphics: Graphics, palette: PetColorPalette): void {
  graphics.clear();

  graphics
    .ellipse(0, -25, 58, 48)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
}

/**
 * Dibuja las orejas delanteras (Capa 4).
 * Usado para orejas 'floppy' que caen a los lados enmarcando el rostro.
 */
export function drawFrontEars(
  graphics: Graphics,
  ears: EarStyle,
  palette: PetColorPalette
): void {
  graphics.clear();

  if (ears === 'floppy') {
    // Oreja izquierda caída
    graphics
      .ellipse(-54, -6, 14, 28)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.ellipse(-54, -2, 9, 20).fill({ color: palette.earInner });

    // Oreja derecha caída
    graphics
      .ellipse(54, -6, 14, 28)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.ellipse(54, -2, 9, 20).fill({ color: palette.earInner });
  }
}

/**
 * Dibuja los ojos según el estilo seleccionado (Capa 5).
 */
export function drawEyes(
  graphics: Graphics,
  eyes: EyeStyle,
  palette: PetColorPalette
): void {
  graphics.clear();

  const eyeX = 20;
  const eyeY = -25;

  if (eyes === 'round') {
    for (const sign of [-1, 1]) {
      const ex = sign * eyeX;
      graphics
        .ellipse(ex, eyeY, 12, 14)
        .fill({ color: FACIAL_FEATURE_COLORS.eyeWhite })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics.circle(ex, eyeY + 1, 8).fill({ color: FACIAL_FEATURE_COLORS.eyePupil });
      graphics.circle(ex - 2, eyeY - 2, 3.5).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });
      graphics.circle(ex + 3, eyeY + 4, 1.5).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });
    }
  } else if (eyes === 'sleepy') {
    for (const sign of [-1, 1]) {
      const ex = sign * eyeX;
      graphics
        .ellipse(ex, eyeY, 12, 13)
        .fill({ color: FACIAL_FEATURE_COLORS.eyeWhite })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics.circle(ex, eyeY + 3, 7.5).fill({ color: FACIAL_FEATURE_COLORS.eyePupil });
      graphics.circle(ex - 2, eyeY + 1, 2.5).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });
      // Párpado superior caído
      graphics
        .roundRect(ex - 14, eyeY - 14, 28, 14, 4)
        .fill({ color: palette.primary })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
    }
  } else if (eyes === 'happy') {
    // Ojo izquierdo feliz curvado hacia arriba (^_^)
    graphics
      .moveTo(-30, -21)
      .quadraticCurveTo(-20, -32, -10, -21)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.5 });
    graphics
      .moveTo(-29, -23)
      .lineTo(-34, -27)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });

    // Ojo derecho feliz
    graphics
      .moveTo(10, -21)
      .quadraticCurveTo(20, -32, 30, -21)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.5 });
    graphics
      .moveTo(29, -23)
      .lineTo(34, -27)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
  } else if (eyes === 'star') {
    for (const sign of [-1, 1]) {
      const ex = sign * eyeX;
      const points = [
        ex, eyeY - 13,
        ex + 4, eyeY - 4,
        ex + 13, eyeY,
        ex + 4, eyeY + 4,
        ex, eyeY + 13,
        ex - 4, eyeY + 4,
        ex - 13, eyeY,
        ex - 4, eyeY - 4,
      ];
      graphics
        .poly(points)
        .fill({ color: FACIAL_FEATURE_COLORS.starEye })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics.circle(ex, eyeY, 2.5).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });
    }
  }
}

/**
 * Dibuja la boca, mejillas y nariz (Capa 6).
 */
export function drawMouthAndCheeks(
  graphics: Graphics,
  mouth: MouthStyle
): void {
  graphics.clear();

  // Mejillas sonrosadas
  graphics
    .ellipse(-34, -14, 9, 6)
    .fill({ color: FACIAL_FEATURE_COLORS.cheeks, alpha: FACIAL_FEATURE_COLORS.cheeksAlpha });
  graphics
    .ellipse(34, -14, 9, 6)
    .fill({ color: FACIAL_FEATURE_COLORS.cheeks, alpha: FACIAL_FEATURE_COLORS.cheeksAlpha });

  // Nariz pequeña
  graphics.ellipse(0, -17, 3.5, 2.5).fill({ color: FACIAL_FEATURE_COLORS.nose });

  // Boca según estilo
  if (mouth === 'smile') {
    graphics
      .moveTo(0, -14)
      .quadraticCurveTo(-5, -8, -10, -11)
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.5 });
    graphics
      .moveTo(0, -14)
      .quadraticCurveTo(5, -8, 10, -11)
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.5 });
  } else if (mouth === 'open') {
    graphics
      .poly([-8, -12, 8, -12, 6, -3, -6, -3])
      .fill({ color: FACIAL_FEATURE_COLORS.mouthInside })
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.5 });
    graphics.ellipse(0, -4, 4.5, 2.5).fill({ color: 0xFF8A80 });
  } else if (mouth === 'neutral') {
    graphics
      .moveTo(-7, -10)
      .lineTo(7, -10)
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.5 });
  }
}

/**
 * Dibuja las prendas o accesorios equipados (Capa 7).
 */
export function drawClothes(graphics: Graphics, clothes?: PetClothes): void {
  graphics.clear();

  if (!clothes) {
    return;
  }

  // 1. Camisa / ropa de torso
  if (clothes.shirt) {
    const shirtColor = clothes.shirt.includes('blue') ? 0x1E88E5 : 0xE53935;
    graphics
      .roundRect(-36, 26, 72, 36, 10)
      .fill({ color: shirtColor })
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
    // Cuello de la camisa
    graphics
      .poly([-16, 26, 0, 38, 16, 26])
      .fill({ color: 0xFFFFFF })
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
  }

  // 2. Accesorio (pajarita / lentes)
  if (clothes.accessory) {
    if (clothes.accessory === 'glasses') {
      graphics
        .circle(-20, -25, 14)
        .stroke({ color: 0x212121, width: 3 });
      graphics
        .circle(20, -25, 14)
        .stroke({ color: 0x212121, width: 3 });
      graphics
        .moveTo(-6, -25)
        .lineTo(6, -25)
        .stroke({ color: 0x212121, width: 3 });
    } else {
      // Pajarita por defecto
      graphics
        .poly([-14, 10, 0, 16, -14, 22])
        .fill({ color: 0xE53935 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics
        .poly([14, 10, 0, 16, 14, 22])
        .fill({ color: 0xE53935 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics.circle(0, 16, 3.5).fill({ color: 0xD32F2F });
    }
  }

  // 3. Sombrero
  if (clothes.hat) {
    if (clothes.hat === 'cap') {
      graphics
        .ellipse(0, -70, 36, 10)
        .fill({ color: 0x1E88E5 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
      graphics
        .roundRect(-24, -86, 48, 20, 8)
        .fill({ color: 0x1E88E5 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
    } else {
      // Cono de fiesta por defecto
      graphics
        .poly([-22, -66, 0, -112, 22, -66])
        .fill({ color: 0xAB47BC })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
      // Rayas decorativas
      graphics.poly([-14, -80, 0, -112, 14, -80]).fill({ color: 0xFFCA28 });
      // Pompón
      graphics
        .circle(0, -114, 7)
        .fill({ color: 0xFFEE58 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
    }
  }
}
