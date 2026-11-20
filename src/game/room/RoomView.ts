import { Container, Graphics, type DestroyOptions } from 'pixi.js';

/**
 * Capa de fondo procedimental de la habitación para Pet Society en resolución 800x600.
 *
 * Dibuja de forma 100% vectorial (sin depender de imágenes externas):
 * - Pared superior con papel tapiz cálido y ventana panorámica con cielo y colinas.
 * - Cornisa de techo y zócalo / rodapié con molduras realistas.
 * - Suelo espacioso de tablones de madera pulida (parquet) en perspectiva clásica.
 */
export class RoomView extends Container {
  private readonly wallGraphics = new Graphics();
  private readonly windowGraphics = new Graphics();
  private readonly baseboardGraphics = new Graphics();
  private readonly floorGraphics = new Graphics();

  constructor() {
    super();

    this.label = 'room-background';

    this.addChild(this.wallGraphics);
    this.addChild(this.windowGraphics);
    this.addChild(this.baseboardGraphics);
    this.addChild(this.floorGraphics);

    this.renderRoom();
  }

  /**
   * Dibuja todas las capas estructurales del escenario de la habitación.
   */
  renderRoom(): void {
    this.renderWall();
    this.renderWindow();
    this.renderBaseboard();
    this.renderFloor();
  }

  /**
   * Dibuja la pared superior y la cornisa de techo.
   */
  private renderWall(): void {
    this.wallGraphics.clear();

    // 1. Fondo base del papel tapiz (crema suave y cálido)
    this.wallGraphics.rect(0, 0, 800, 300).fill({ color: 0xfffdf7 });

    // 2. Franjas verticales de papel tapiz en tono sutil
    const stripeWidth = 20;
    const stripeGap = 20;
    for (let x = 0; x < 800; x += stripeWidth + stripeGap) {
      this.wallGraphics.rect(x, 18, stripeWidth, 282).fill({ color: 0xf5ece1, alpha: 0.6 });
    }

    // 3. Cornisa superior de techo (moldura superior)
    this.wallGraphics.rect(0, 0, 800, 14).fill({ color: 0xf3ede2 });
    this.wallGraphics.rect(0, 14, 800, 4).fill({ color: 0xe2dac9 });
  }

  /**
   * Dibuja una ventana central arqueada con vista al exterior (cielo azul, colinas verdes y nubes).
   */
  private renderWindow(): void {
    this.windowGraphics.clear();

    const winX = 400;
    const winY = 145;
    const winW = 140;
    const winH = 160;
    const left = winX - winW / 2;
    const top = winY - winH / 2;

    // 1. Marco exterior blanco arqueado
    this.windowGraphics
      .roundRect(left - 8, top - 8, winW + 16, winH + 16, 28)
      .fill({ color: 0xffffff })
      .stroke({ color: 0xd9d0c1, width: 3 });

    // 2. Interior de la ventana: cielo azul luminoso
    this.windowGraphics.roundRect(left, top, winW, winH, 20).fill({ color: 0xa2d2ff });

    // 3. Colina lejana verde en la base de la ventana
    this.windowGraphics
      .ellipse(winX, top + winH + 10, winW / 2 + 10, 50)
      .fill({ color: 0x95d5b2 });

    // 4. Nubes suaves procedimentales
    // Nube izquierda
    this.windowGraphics.ellipse(left + 35, top + 45, 18, 12).fill({ color: 0xffffff });
    this.windowGraphics.circle(left + 45, top + 38, 14).fill({ color: 0xffffff });
    this.windowGraphics.circle(left + 26, top + 42, 10).fill({ color: 0xffffff });

    // Nube derecha
    this.windowGraphics.ellipse(left + 100, top + 55, 16, 10).fill({ color: 0xffffff });
    this.windowGraphics.circle(left + 110, top + 50, 12).fill({ color: 0xffffff });

    // 5. Cruceta de madera blanca (parteluces)
    this.windowGraphics.rect(winX - 3, top, 6, winH).fill({ color: 0xffffff });
    this.windowGraphics.rect(left, top + winH * 0.48 - 3, winW, 6).fill({ color: 0xffffff });

    // 6. Alféizar / Repisa inferior de la ventana
    this.windowGraphics
      .roundRect(left - 16, top + winH - 2, winW + 32, 14, 4)
      .fill({ color: 0xffffff })
      .stroke({ color: 0xd9d0c1, width: 2 });
  }

  /**
   * Dibuja el zócalo / rodapié con relieve de madera clara.
   */
  private renderBaseboard(): void {
    this.baseboardGraphics.clear();

    const startY = 300;

    // Moldura superior con bisel
    this.baseboardGraphics.rect(0, startY, 800, 4).fill({ color: 0xe5dfd3 });
    // Tablón central principal del rodapié
    this.baseboardGraphics.rect(0, startY + 4, 800, 20).fill({ color: 0xf5f0e6 });
    // Ranura inferior con sombra
    this.baseboardGraphics.rect(0, startY + 24, 800, 6).fill({ color: 0xd2c9b8 });
  }

  /**
   * Dibuja el suelo de parquet de madera cálida con tablones escalonados y líneas de junta.
   */
  private renderFloor(): void {
    this.floorGraphics.clear();

    const floorStartY = 330;
    const floorHeight = 270;

    // 1. Color base de madera cálida
    this.floorGraphics.rect(0, floorStartY, 800, floorHeight).fill({ color: 0xdeb887 });

    // 2. Sombra de contacto bajo el zócalo
    this.floorGraphics.rect(0, floorStartY, 800, 10).fill({ color: 0x8a6237, alpha: 0.25 });

    // 3. Tablones horizontales con variación de tono sutil
    const rowHeights = [45, 50, 55, 60, 60];
    const rowOffsets = [120, 60, 150, 80, 170];
    let currentY = floorStartY;

    for (let r = 0; r < rowHeights.length; r++) {
      const h = rowHeights[r];

      // Tablón horizontal
      if (r % 2 === 1) {
        this.floorGraphics.rect(0, currentY, 800, h).fill({ color: 0xe5c397, alpha: 0.35 });
      }

      // Juntas verticales escalonadas entre tablones
      const offset = rowOffsets[r];
      for (let x = offset; x < 800; x += 190) {
        this.floorGraphics.rect(x, currentY, 2, h).fill({ color: 0xba9362, alpha: 0.7 });
      }

      // Línea divisoria horizontal entre filas de tablones
      this.floorGraphics.rect(0, currentY + h - 2, 800, 2).fill({ color: 0xba9362 });

      currentY += h;
    }
  }

  override destroy(options?: DestroyOptions): void {
    super.destroy(options ?? { children: true });
  }
}
