/**
 * Dibujadores vectoriales procedimentales para los muebles y decoraciones de Pet Society.
 *
 * Cada mueble se dibuja utilizando únicamente primitivas vectoriales de PixiJS Graphics
 * (rect, roundRect, circle, ellipse, poly) sin requerir texturas externas ni imágenes ráster.
 *
 * El origen local (0, 0) de cada mueble corresponde a su punto de anclaje de contacto
 * (centro-inferior), lo que garantiza un ordenamiento de profundidad natural (z-sorting).
 * Las sombras de contacto en el suelo se gestionan de forma desacoplada para permitir
 * elevación y escala reactiva durante el arrastre (R-01: SoC).
 */

import { Graphics } from 'pixi.js';

/**
 * Dibuja la sombra de contacto elíptica suave en el suelo para un mueble.
 */
export function drawFurnitureShadow(graphics: Graphics, width = 80): void {
  graphics.clear();
  const radiusX = Math.round(width * 0.44);
  const radiusY = Math.round(Math.max(6, width * 0.11));

  // 1. Difuminado exterior suave
  graphics.ellipse(0, 0, radiusX, radiusY).fill({ color: 0x2b1d0c, alpha: 0.16 });
  // 2. Núcleo más oscuro de contacto
  graphics
    .ellipse(0, 0, Math.round(radiusX * 0.72), Math.round(radiusY * 0.7))
    .fill({ color: 0x1a0f05, alpha: 0.22 });
}

/**
 * Dibuja una cama clásica de madera con sábanas suaves y almohada mullida.
 */
export function drawBed(graphics: Graphics): void {
  graphics.clear();

  // 1. Cabecero trasero de madera
  graphics
    .roundRect(-75, -88, 150, 60, 8)
    .fill({ color: 0x8C5A2B })
    .stroke({ color: 0x5E3A18, width: 3 });

  // Postes decorativos laterales del cabecero
  graphics.roundRect(-80, -96, 12, 70, 4).fill({ color: 0x6F431B });
  graphics.roundRect(68, -96, 12, 70, 4).fill({ color: 0x6F431B });
  // Pomos esféricos dorados / madera pulida
  graphics.circle(-74, -98, 7).fill({ color: 0xD4A373 });
  graphics.circle(74, -98, 7).fill({ color: 0xD4A373 });

  // 2. Almohada mullida
  graphics
    .roundRect(-45, -72, 90, 26, 10)
    .fill({ color: 0xFFFFFF })
    .stroke({ color: 0xDEE2E6, width: 2 });
  graphics.roundRect(-20, -62, 40, 6, 3).fill({ color: 0xEDEDED });

  // 3. Base del colchón
  graphics.roundRect(-70, -42, 140, 36, 6).fill({ color: 0xECE4DB });

  // 4. Edredón / Colcha en tono menta suave
  graphics
    .roundRect(-72, -40, 144, 38, 8)
    .fill({ color: 0x90BE6D })
    .stroke({ color: 0x588157, width: 2.5 });

  // Dobladillo superior de la sábana blanca
  graphics
    .roundRect(-68, -45, 136, 12, 5)
    .fill({ color: 0xFDFBF7 })
    .stroke({ color: 0xD5CDBF, width: 1.5 });

  // Estampado decorativo sutil en el edredón
  graphics.circle(-40, -22, 3).fill({ color: 0x588157, alpha: 0.5 });
  graphics.circle(-10, -26, 3).fill({ color: 0x588157, alpha: 0.5 });
  graphics.circle(20, -22, 3).fill({ color: 0x588157, alpha: 0.5 });
  graphics.circle(50, -26, 3).fill({ color: 0x588157, alpha: 0.5 });
  graphics.circle(-25, -10, 3).fill({ color: 0x588157, alpha: 0.5 });
  graphics.circle(5, -12, 3).fill({ color: 0x588157, alpha: 0.5 });
  graphics.circle(35, -10, 3).fill({ color: 0x588157, alpha: 0.5 });

  // 5. Patas delanteras de apoyo
  graphics.roundRect(-70, -6, 10, 8, 2).fill({ color: 0x5E3A18 });
  graphics.roundRect(60, -6, 10, 8, 2).fill({ color: 0x5E3A18 });
}

/**
 * Dibuja una mesa redonda de madera pulida con jarrón y flor.
 */
export function drawTable(graphics: Graphics): void {
  graphics.clear();

  // 1. Patas traseras (tono más sombreado)
  graphics.roundRect(-34, -40, 7, 36, 2).fill({ color: 0x734822 });
  graphics.roundRect(27, -40, 7, 36, 2).fill({ color: 0x734822 });

  // 2. Patas delanteras
  graphics.roundRect(-42, -34, 8, 34, 2).fill({ color: 0x8C5A2B });
  graphics.roundRect(34, -34, 8, 34, 2).fill({ color: 0x8C5A2B });

  // 3. Faldón bajo la tapa de la mesa
  graphics.roundRect(-42, -44, 84, 12, 3).fill({ color: 0x7A4C22 });

  // 4. Tapa ovalada de madera pulida
  graphics
    .ellipse(0, -45, 52, 18)
    .fill({ color: 0x8C5A2B })
    .stroke({ color: 0x5E3A18, width: 2.5 });
  graphics.ellipse(0, -47, 48, 15).fill({ color: 0xB58252 });
  // Reflejo de luz en la madera
  graphics.ellipse(-10, -49, 32, 8).fill({ color: 0xCFA278, alpha: 0.6 });

  // 5. Centro de mesa: jarrón cerámico con flor
  graphics
    .roundRect(-7, -64, 14, 16, 4)
    .fill({ color: 0xFDFBF7 })
    .stroke({ color: 0xD0C8B8, width: 1.5 });
  graphics.rect(-1, -72, 2, 9).fill({ color: 0x40916C });
  // Pétalos naranjas / dorados
  graphics.circle(-4, -74, 3).fill({ color: 0xF77F00 });
  graphics.circle(4, -74, 3).fill({ color: 0xF77F00 });
  graphics.circle(0, -78, 3).fill({ color: 0xF77F00 });
  graphics.circle(0, -74, 2.5).fill({ color: 0xFCBF49 });
}

/**
 * Dibuja una lámpara de pie estilizada con base dorada y pantalla con brillo cálido.
 */
export function drawLamp(graphics: Graphics): void {
  graphics.clear();

  // 1. Halo de luz cálida ambiental
  graphics.circle(0, -118, 52).fill({ color: 0xFFF3B0, alpha: 0.22 });
  graphics.circle(0, -118, 32).fill({ color: 0xFFEAA7, alpha: 0.32 });

  // 2. Base dorada ponderada
  graphics
    .ellipse(0, -3, 22, 6)
    .fill({ color: 0xD4AF37 })
    .stroke({ color: 0x997A15, width: 2 });
  graphics.ellipse(0, -5, 16, 4).fill({ color: 0xF0D264 });

  // 3. Mástil vertical de latón
  graphics
    .roundRect(-3, -115, 6, 110, 2)
    .fill({ color: 0xD4AF37 })
    .stroke({ color: 0x997A15, width: 1.5 });

  // Cadenilla de encendido con bola dorada
  graphics.rect(8, -108, 1.5, 16).fill({ color: 0x997A15 });
  graphics.circle(8.75, -92, 2.5).fill({ color: 0xD4AF37 });

  // 4. Pantalla acampanada en tono marfil
  graphics
    .poly([-18, -138, 18, -138, 29, -100, -29, -100])
    .fill({ color: 0xFEFAE0 })
    .stroke({ color: 0xCCA43B, width: 2 });
  graphics
    .ellipse(0, -100, 29, 6)
    .fill({ color: 0xFAEDCD })
    .stroke({ color: 0xCCA43B, width: 1.5 });

  // Remate superior dorado
  graphics.ellipse(0, -138, 18, 4).fill({ color: 0xD4AF37 });
  graphics.circle(0, -142, 4).fill({ color: 0xF0D264 });
}

/**
 * Dibuja una planta de interior tipo monstera en maceta de terracota.
 */
export function drawPlant(graphics: Graphics): void {
  graphics.clear();

  // 1. Maceta de terracota
  graphics
    .poly([-22, -38, 22, -38, 15, -2, -15, -2])
    .fill({ color: 0xCB6843 })
    .stroke({ color: 0x8C3A1E, width: 2 });
  // Lado en sombra de la maceta
  graphics.poly([6, -38, 22, -38, 15, -2, 4, -2]).fill({ color: 0xA84D2B });

  // Borde superior de la maceta
  graphics
    .roundRect(-25, -44, 50, 8, 3)
    .fill({ color: 0xE07A5F })
    .stroke({ color: 0x8C3A1E, width: 1.5 });
  // Tierra oscura
  graphics.ellipse(0, -43, 20, 4).fill({ color: 0x3E2723 });

  // 2. Tallos verdes
  graphics.poly([-2, -43, -1, -62, 1, -62, 2, -43]).fill({ color: 0x2D6A4F });
  graphics.poly([-2, -43, -16, -58, -14, -60, 0, -43]).fill({ color: 0x2D6A4F });
  graphics.poly([1, -43, 16, -56, 18, -58, 2, -43]).fill({ color: 0x2D6A4F });

  // 3. Hojas tropicales frondosas
  // Hoja central alta
  graphics
    .ellipse(0, -72, 14, 22)
    .fill({ color: 0x40916C })
    .stroke({ color: 0x1B4332, width: 2 });
  graphics.ellipse(0, -72, 2, 16).fill({ color: 0x74C69D });

  // Hoja izquierda
  graphics
    .ellipse(-22, -64, 16, 12)
    .fill({ color: 0x52B788 })
    .stroke({ color: 0x1B4332, width: 1.5 });
  graphics.ellipse(-22, -64, 10, 2).fill({ color: 0x95D5B2 });

  // Hoja derecha
  graphics
    .ellipse(22, -62, 16, 12)
    .fill({ color: 0x2D6A4F })
    .stroke({ color: 0x1B4332, width: 1.5 });
  graphics.ellipse(22, -62, 10, 2).fill({ color: 0x52B788 });

  // Hoja delantera pequeña
  graphics
    .ellipse(-6, -50, 11, 8)
    .fill({ color: 0x74C69D })
    .stroke({ color: 0x2D6A4F, width: 1.5 });
}

/**
 * Dibuja un cuadro decorativo de pared con paisaje al óleo y marco dorado.
 */
export function drawPainting(graphics: Graphics): void {
  graphics.clear();

  // Marco de madera tallada con borde dorado
  graphics
    .roundRect(-45, -60, 90, 60, 4)
    .fill({ color: 0x8C5A2B })
    .stroke({ color: 0xD4AF37, width: 3 });

  // Lienzo interior con paisaje
  graphics.roundRect(-38, -53, 76, 46, 2).fill({ color: 0x90CAF9 });

  // Sol y colinas en el cuadro
  graphics.circle(-18, -40, 7).fill({ color: 0xFFE082 });
  graphics.ellipse(10, -16, 32, 16).fill({ color: 0x81C784 });
  graphics.ellipse(-14, -14, 26, 14).fill({ color: 0x4CAF50 });

  // Cuerda colgador en la parte superior
  graphics.poly([-12, -60, 0, -68, 12, -60]).stroke({ color: 0xD4AF37, width: 1.5 });
  graphics.circle(0, -68, 2.5).fill({ color: 0xD4AF37 });
}

/**
 * Dibuja un reloj de pared vintage con péndulo.
 */
export function drawClock(graphics: Graphics): void {
  graphics.clear();

  // Caja de madera de caoba
  graphics
    .roundRect(-22, -75, 44, 75, 5)
    .fill({ color: 0x5E3A18 })
    .stroke({ color: 0x3D230D, width: 2 });

  // Esfera del reloj
  graphics.circle(0, -50, 15).fill({ color: 0xFFFDF7 }).stroke({ color: 0xD4AF37, width: 2 });
  // Manecillas
  graphics.rect(-1, -50, 2, 8).fill({ color: 0x212121 });
  graphics.rect(-1, -50, 6, 2).fill({ color: 0x212121 });

  // Ventana inferior de cristal para el péndulo
  graphics.roundRect(-14, -30, 28, 24, 3).fill({ color: 0x1A0F05 });
  // Varilla y lenteja de péndulo dorado
  graphics.rect(-1, -30, 2, 16).fill({ color: 0xD4AF37 });
  graphics.circle(0, -14, 5).fill({ color: 0xF0D264 }).stroke({ color: 0x997A15, width: 1 });
}

/**
 * Dibuja una ventana victoriana de madera para la pared.
 */
export function drawWallWindow(graphics: Graphics): void {
  graphics.clear();

  // Marco de madera blanca arqueado
  graphics
    .roundRect(-50, -120, 100, 120, 20)
    .fill({ color: 0xFFFFFF })
    .stroke({ color: 0xD9D0C1, width: 3 });

  // Cristal con cielo
  graphics.roundRect(-42, -112, 84, 104, 14).fill({ color: 0xA2D2FF });
  graphics.ellipse(0, -12, 44, 22).fill({ color: 0x95D5B2 });

  // Cruceta
  graphics.rect(-2, -112, 4, 104).fill({ color: 0xFFFFFF });
  graphics.rect(-42, -64, 84, 4).fill({ color: 0xFFFFFF });

  // Repisa
  graphics.roundRect(-58, -6, 116, 10, 3).fill({ color: 0xFFFFFF }).stroke({ color: 0xD9D0C1, width: 1.5 });
}

/**
 * Dibuja un mueble por defecto (cajón/baúl de madera) si se recibe un ID desconocido.
 */
export function drawFallbackFurniture(graphics: Graphics): void {
  graphics.clear();
  graphics
    .roundRect(-30, -50, 60, 50, 6)
    .fill({ color: 0xD4A373 })
    .stroke({ color: 0x6B4B27, width: 2 });
  graphics.rect(-28, -28, 56, 6).fill({ color: 0xB58252 });
}

/**
 * Despacha el dibujado vectorial adecuado según el ID del mueble.
 */
export function drawFurnitureGraphics(graphics: Graphics, itemId: string): void {
  const lower = itemId.toLowerCase();
  if (lower.includes('bed')) {
    drawBed(graphics);
  } else if (lower.includes('table')) {
    drawTable(graphics);
  } else if (lower.includes('lamp')) {
    drawLamp(graphics);
  } else if (lower.includes('plant')) {
    drawPlant(graphics);
  } else if (lower.includes('painting')) {
    drawPainting(graphics);
  } else if (lower.includes('clock')) {
    drawClock(graphics);
  } else if (lower.includes('window')) {
    drawWallWindow(graphics);
  } else {
    drawFallbackFurniture(graphics);
  }
}
