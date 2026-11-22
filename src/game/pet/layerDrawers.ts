import { Graphics } from 'pixi.js';
import type { EarStyle, EyeStyle, MouthStyle, PetClothes } from '../../domain';
import { FACIAL_FEATURE_COLORS } from './palette';
import type { DrawBodyOptions, DrawEyeOptions, PetColorPalette } from './types';

/**
 * Dibuja la sombra elíptica difuminada de anclaje físico al suelo (Capa 0).
 *
 * Utiliza múltiples elipses concéntricas con opacidad decreciente para
 * emular un difuminado vectorial suave sin depender de texturas de mapa de bits.
 */
export function drawShadow(graphics: Graphics): void {
  graphics.clear();

  const shadowY = 64;

  // Capa exterior difusa suave
  graphics.ellipse(0, shadowY, 48, 14).fill({ color: 0x1a202c, alpha: 0.1 });

  // Capa media
  graphics.ellipse(0, shadowY, 38, 10).fill({ color: 0x1a202c, alpha: 0.16 });

  // Núcleo central de oclusión ambiental bajo los pies
  graphics.ellipse(0, shadowY, 28, 7).fill({ color: 0x1a202c, alpha: 0.22 });
}

/**
 * Dibuja las orejas traseras (Capa 1).
 * Para orejas 'round' o 'pointy' se dibujan detrás de la cabeza para
 * lograr una silueta limpia donde la cabeza redondeada se sobrepone.
 */
export function drawBackEars(
  graphics: Graphics,
  ears: EarStyle,
  palette: PetColorPalette
): void {
  graphics.clear();

  if (ears === 'round') {
    // Oreja izquierda estilo osito adorable
    graphics
      .circle(-50, -64, 23)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.circle(-50, -64, 14).fill({ color: palette.earInner });

    // Brillo sutil en la curva superior de la oreja izquierda
    graphics.circle(-54, -70, 4).fill({ color: 0xffffff, alpha: 0.3 });

    // Oreja derecha estilo osito adorable
    graphics
      .circle(50, -64, 23)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.circle(50, -64, 14).fill({ color: palette.earInner });

    // Brillo en la curva superior de la oreja derecha
    graphics.circle(46, -70, 4).fill({ color: 0xffffff, alpha: 0.3 });
  } else if (ears === 'pointy') {
    // Oreja puntiaguda izquierda (gatito / zorrito Chibi)
    graphics
      .poly([-60, -32, -50, -82, -22, -54])
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.poly([-54, -38, -48, -74, -28, -54]).fill({ color: palette.earInner });

    // Oreja puntiaguda derecha
    graphics
      .poly([22, -54, 50, -82, 60, -32])
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.poly([28, -54, 48, -74, 54, -38]).fill({ color: palette.earInner });
  }
}

/**
 * Dibuja el cuerpo, vientre y extremidades con proporciones compactas Chibi (Capa 2).
 * Admite offsets de caminata para alternancia de patitas y balanceo de brazos.
 */
export function drawBody(
  graphics: Graphics,
  palette: PetColorPalette,
  options?: DrawBodyOptions
): void {
  graphics.clear();

  const leftFootY = options?.leftFootY ?? 0;
  const rightFootY = options?.rightFootY ?? 0;
  const leftArmY = options?.leftArmY ?? 0;
  const rightArmY = options?.rightArmY ?? 0;

  // 1. Patas inferiores tiernas y redondeadas apoyadas en el suelo
  // Pata izquierda
  graphics
    .ellipse(-24, 60 + leftFootY, 16, 10)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
  // Ranuras sutiles de los deditos
  graphics
    .moveTo(-28, 62 + leftFootY)
    .lineTo(-28, 67 + leftFootY)
    .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
  graphics
    .moveTo(-22, 63 + leftFootY)
    .lineTo(-22, 68 + leftFootY)
    .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });

  // Pata derecha
  graphics
    .ellipse(24, 60 + rightFootY, 16, 10)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
  graphics
    .moveTo(22, 63 + rightFootY)
    .lineTo(22, 68 + rightFootY)
    .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
  graphics
    .moveTo(28, 62 + rightFootY)
    .lineTo(28, 67 + rightFootY)
    .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });

  // 2. Torso compacto y rechoncho (proporción Chibi clásica)
  graphics
    .ellipse(0, 32, 36, 28)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });

  // 3. Parche del vientre (contraste suave más claro)
  graphics.ellipse(0, 34, 24, 20).fill({ color: palette.belly });

  // 4. Brazos / patitas delanteras descansando adorablemente en los costados
  // Brazo izquierdo
  graphics
    .ellipse(-34, 30 + leftArmY, 10, 14)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });

  // Brazo derecho
  graphics
    .ellipse(34, 30 + rightArmY, 10, 14)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });
}

/**
 * Dibuja la cabeza Chibi prominente con volumen, brillos Flash y sombra ambiental (Capa 3).
 */
export function drawHead(graphics: Graphics, palette: PetColorPalette): void {
  graphics.clear();

  // 1. Silueta principal de cabeza ancha, redondeada y dominante
  graphics
    .ellipse(0, -26, 64, 52)
    .fill({ color: palette.primary })
    .stroke({
      color: FACIAL_FEATURE_COLORS.outline,
      width: FACIAL_FEATURE_COLORS.outlineWidth,
    });

  // 2. Sombra de oclusión ambiental sutil bajo el mentón para profundidad
  graphics.ellipse(0, 20, 34, 8).fill({ color: palette.shadow, alpha: 0.25 });

  // 3. Brillos especulares curvos característicos del estilo Flash vectorial (juguete toyetic)
  // Brillo principal en la curvatura superior izquierda de la frente
  graphics.ellipse(-18, -62, 30, 9).fill({ color: 0xffffff, alpha: 0.35 });

  // Brillo secundario tipo twinkle a la derecha
  graphics.circle(18, -64, 4).fill({ color: 0xffffff, alpha: 0.22 });
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
    // Oreja izquierda caída con contorno y relleno suave
    graphics
      .ellipse(-58, -6, 15, 30)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.ellipse(-58, -2, 9, 21).fill({ color: palette.earInner });

    // Oreja derecha caída
    graphics
      .ellipse(58, -6, 15, 30)
      .fill({ color: palette.primary })
      .stroke({
        color: FACIAL_FEATURE_COLORS.outline,
        width: FACIAL_FEATURE_COLORS.outlineWidth,
      });
    graphics.ellipse(58, -2, 9, 21).fill({ color: palette.earInner });
  }
}

/**
 * Dibuja los ojos según el estilo, con pupilas que siguen el cursor y parpadeo reactivo (Capa 5).
 */
export function drawEyes(
  graphics: Graphics,
  eyes: EyeStyle,
  palette: PetColorPalette,
  options?: DrawEyeOptions
): void {
  graphics.clear();

  const eyeX = 22;
  const eyeY = -26;
  const pupilOffset = options?.pupilOffset ?? { x: 0, y: 0 };
  const blinkProgress = options?.blinkProgress ?? 0;

  if (eyes === 'round') {
    for (const sign of [-1, 1]) {
      const ex = sign * eyeX;

      // Parpadeo completo (ojo cerrado): arco de pestañas adorable
      if (blinkProgress >= 0.85) {
        graphics
          .moveTo(ex - 12, eyeY + 1)
          .quadraticCurveTo(ex, eyeY + 8, ex + 12, eyeY + 1)
          .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.5 });

        // Pestaña lateral
        graphics
          .moveTo(ex + sign * 8, eyeY + 1)
          .lineTo(ex + sign * 13, eyeY - 4)
          .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.2 });
        continue;
      }

      // Globo ocular blanco con contorno
      graphics
        .ellipse(ex, eyeY, 13, 16)
        .fill({ color: FACIAL_FEATURE_COLORS.eyeWhite })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });

      // Pupila reactiva al cursor
      const px = ex + pupilOffset.x;
      const py = eyeY + 1 + pupilOffset.y;
      graphics.circle(px, py, 8.5).fill({ color: FACIAL_FEATURE_COLORS.eyePupil });

      // Brillo especular principal grande estilo Flash / Playfish
      graphics.circle(px - 3, py - 3, 4).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });

      // Brillo secundario pequeño (twinkle)
      graphics.circle(px + 3, py + 4, 1.8).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });

      // Descenso del párpado durante la transición de parpadeo
      if (blinkProgress > 0) {
        const eyelidHeight = 32 * blinkProgress;
        graphics
          .roundRect(ex - 15, eyeY - 17, 30, eyelidHeight, 6)
          .fill({ color: palette.primary })
          .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
      }
    }
  } else if (eyes === 'sleepy') {
    for (const sign of [-1, 1]) {
      const ex = sign * eyeX;

      if (blinkProgress >= 0.85) {
        graphics
          .moveTo(ex - 12, eyeY + 3)
          .quadraticCurveTo(ex, eyeY + 8, ex + 12, eyeY + 3)
          .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.5 });
        continue;
      }

      graphics
        .ellipse(ex, eyeY, 13, 15)
        .fill({ color: FACIAL_FEATURE_COLORS.eyeWhite })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });

      const px = ex + pupilOffset.x;
      const py = eyeY + 3 + pupilOffset.y;
      graphics.circle(px, py, 8).fill({ color: FACIAL_FEATURE_COLORS.eyePupil });
      graphics.circle(px - 3, py + 1, 3).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });

      // Párpado superior caído característico del estilo soñoliento
      const extraBlink = blinkProgress * 14;
      graphics
        .roundRect(ex - 15, eyeY - 16, 30, 16 + extraBlink, 4)
        .fill({ color: palette.primary })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
    }
  } else if (eyes === 'happy') {
    // Ojos felices curvados hacia arriba (^_^) que reaccionan con un sutil rebote al parpadear
    const squeeze = blinkProgress * 3;

    // Ojo izquierdo
    graphics
      .moveTo(-34, -20 + squeeze)
      .quadraticCurveTo(-22, -33 + squeeze, -10, -20 + squeeze)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.8 });
    graphics
      .moveTo(-33, -22 + squeeze)
      .lineTo(-38, -27 + squeeze)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });

    // Ojo derecho
    graphics
      .moveTo(10, -20 + squeeze)
      .quadraticCurveTo(22, -33 + squeeze, 34, -20 + squeeze)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.8 });
    graphics
      .moveTo(33, -22 + squeeze)
      .lineTo(38, -27 + squeeze)
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
  } else if (eyes === 'star') {
    for (const sign of [-1, 1]) {
      const ex = sign * eyeX;

      if (blinkProgress >= 0.85) {
        graphics
          .moveTo(ex - 12, eyeY + 1)
          .lineTo(ex + 12, eyeY + 1)
          .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 3.5 });
        continue;
      }

      const px = ex + pupilOffset.x * 0.7;
      const py = eyeY + pupilOffset.y * 0.7;

      const points = [
        px,
        py - 14,
        px + 4.5,
        py - 4.5,
        px + 14,
        py,
        px + 4.5,
        py + 4.5,
        px,
        py + 14,
        px - 4.5,
        py + 4.5,
        px - 14,
        py,
        px - 4.5,
        py - 4.5,
      ];
      graphics
        .poly(points)
        .fill({ color: FACIAL_FEATURE_COLORS.starEye })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.5 });
      graphics.circle(px, py, 3).fill({ color: FACIAL_FEATURE_COLORS.eyeHighlight });

      if (blinkProgress > 0) {
        graphics
          .roundRect(ex - 15, eyeY - 16, 30, 30 * blinkProgress, 4)
          .fill({ color: palette.primary })
          .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      }
    }
  }
}

/**
 * Dibuja la boca, mejillas sonrosadas y nariz de botón Chibi (Capa 6).
 */
export function drawMouthAndCheeks(
  graphics: Graphics,
  mouth: MouthStyle
): void {
  graphics.clear();

  // 1. Mejillas sonrosadas y sonrientes con destello blanco
  // Mejilla izquierda
  graphics
    .ellipse(-36, -14, 11, 7)
    .fill({ color: FACIAL_FEATURE_COLORS.cheeks, alpha: FACIAL_FEATURE_COLORS.cheeksAlpha });
  graphics.circle(-34, -16, 2.5).fill({ color: 0xffffff, alpha: 0.6 });

  // Mejilla derecha
  graphics
    .ellipse(36, -14, 11, 7)
    .fill({ color: FACIAL_FEATURE_COLORS.cheeks, alpha: FACIAL_FEATURE_COLORS.cheeksAlpha });
  graphics.circle(34, -16, 2.5).fill({ color: 0xffffff, alpha: 0.6 });

  // 2. Nariz pequeña de botón
  graphics.ellipse(0, -18, 4, 2.8).fill({ color: FACIAL_FEATURE_COLORS.nose });

  // 3. Boca según el estilo seleccionado
  if (mouth === 'smile') {
    // Sonrisa Playfish tierna en forma de :3
    graphics
      .moveTo(0, -14)
      .quadraticCurveTo(-6, -7, -12, -10)
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.8 });
    graphics
      .moveTo(0, -14)
      .quadraticCurveTo(6, -7, 12, -10)
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.8 });
  } else if (mouth === 'open') {
    // Boquita abierta alegre con lengüita rosa
    graphics
      .poly([-9, -12, 9, -12, 7, -2, -7, -2])
      .fill({ color: FACIAL_FEATURE_COLORS.mouthInside })
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.8 });
    graphics.ellipse(0, -3, 5, 3).fill({ color: 0xff8a80 });
  } else if (mouth === 'neutral') {
    // Boca neutra tierna y dulce
    graphics
      .moveTo(-8, -10)
      .lineTo(8, -10)
      .stroke({ color: FACIAL_FEATURE_COLORS.mouthLine, width: 2.8 });
  }
}

/**
 * Dibuja las prendas o accesorios equipados adaptados al cuerpo Chibi (Capa 7).
 */
export function drawClothes(graphics: Graphics, clothes?: PetClothes): void {
  graphics.clear();

  if (!clothes) {
    return;
  }

  // 1. Camisa / ropa de torso
  if (clothes.shirt) {
    const shirtColor = clothes.shirt.includes('blue') ? 0x1e88e5 : 0xe53935;
    graphics
      .roundRect(-32, 22, 64, 34, 10)
      .fill({ color: shirtColor })
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.8 });
    // Cuello de la camisa blanco
    graphics
      .poly([-16, 22, 0, 34, 16, 22])
      .fill({ color: 0xffffff })
      .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.2 });
  }

  // 2. Accesorio (pajarita / lentes)
  if (clothes.accessory) {
    if (clothes.accessory === 'glasses') {
      graphics
        .circle(-22, -26, 15)
        .stroke({ color: 0x212121, width: 3.2 });
      graphics
        .circle(22, -26, 15)
        .stroke({ color: 0x212121, width: 3.2 });
      graphics
        .moveTo(-7, -26)
        .lineTo(7, -26)
        .stroke({ color: 0x212121, width: 3.2 });
    } else {
      // Pajarita roja elegante
      graphics
        .poly([-14, 10, 0, 16, -14, 22])
        .fill({ color: 0xe53935 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics
        .poly([14, 10, 0, 16, 14, 22])
        .fill({ color: 0xe53935 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
      graphics.circle(0, 16, 3.5).fill({ color: 0xd32f2f });
    }
  }

  // 3. Sombrero
  if (clothes.hat) {
    if (clothes.hat === 'cap') {
      graphics
        .ellipse(0, -72, 38, 11)
        .fill({ color: 0x1e88e5 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.8 });
      graphics
        .roundRect(-24, -88, 48, 20, 8)
        .fill({ color: 0x1e88e5 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.8 });
    } else {
      // Cono de fiesta festivo
      graphics
        .poly([-22, -68, 0, -114, 22, -68])
        .fill({ color: 0xab47bc })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2.8 });
      // Rayas decorativas
      graphics.poly([-14, -82, 0, -114, 14, -82]).fill({ color: 0xffca28 });
      // Pompón
      graphics
        .circle(0, -116, 7.5)
        .fill({ color: 0xffee58 })
        .stroke({ color: FACIAL_FEATURE_COLORS.outline, width: 2 });
    }
  }
}
