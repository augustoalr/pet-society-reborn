import { Container, Graphics, type DestroyOptions } from 'pixi.js';
import { DEFAULT_FLOOR_GRID, findNearestGridCell } from '../../domain';

/**
 * Escenario Diorama 2.5D procedimental de la habitación estilo casa de muñecas (Playfish/EA).
 *
 * Características estructurales vectoriales (sin texturas externas):
 * - Pared de fondo con papel tapiz cálido, patrón de rayas y cornisa superior moldurada.
 * - Sombreado de esquinas y laterales para profundidad tridimensional de diorama.
 * - Ventana panorámica de casa de muñecas con cielo soleado, colinas, nubes y cortinas pastel.
 * - Zócalo / rodapié con moldura biselada y sombra de contacto profunda sobre el parquet.
 * - Suelo de tablones de madera en perspectiva 2.5D (parquet con escalonamiento progresivo y borde frontal de corte diorama).
 * - Capa de rejilla magnética reactiva para guiar la colocación en el modo "Decorar".
 */
export class RoomView extends Container {
  private readonly wallGraphics = new Graphics();
  private readonly windowGraphics = new Graphics();
  private readonly baseboardGraphics = new Graphics();
  private readonly floorGraphics = new Graphics();
  private readonly gridContainer = new Container();
  private readonly gridGraphics = new Graphics();
  private readonly gridHighlightGraphics = new Graphics();

  constructor() {
    super();

    this.label = 'room-background';

    this.addChild(this.wallGraphics);
    this.addChild(this.windowGraphics);
    this.addChild(this.baseboardGraphics);
    this.addChild(this.floorGraphics);

    this.gridContainer.label = 'room-grid-layer';
    this.gridContainer.addChild(this.gridGraphics);
    this.gridContainer.addChild(this.gridHighlightGraphics);
    this.gridContainer.visible = false;
    this.addChild(this.gridContainer);

    this.renderRoom();
  }

  /** Indica si la visualización de la rejilla magnética se encuentra activa. */
  get gridVisible(): boolean {
    return this.gridContainer.visible;
  }

  /**
   * Dibuja todas las capas estructurales y decorativas del escenario diorama.
   */
  renderRoom(): void {
    this.renderWall();
    this.renderWindow();
    this.renderBaseboard();
    this.renderFloor();
    this.renderGridGuides();
  }

  /**
   * Muestra u oculta las guías visuales de la rejilla de suelo para el modo decoración.
   */
  setGridVisible(visible: boolean): void {
    this.gridContainer.visible = visible;
    if (!visible) {
      this.clearGridHighlight();
    }
  }

  /**
   * Resalta la celda magnética más cercana a unas coordenadas dadas durante el arrastre.
   */
  highlightGridCell(x: number, y: number): void {
    this.gridHighlightGraphics.clear();

    const nearestCell = findNearestGridCell({ x, y }, DEFAULT_FLOOR_GRID);
    if (!nearestCell) {
      return;
    }

    const cellW = DEFAULT_FLOOR_GRID.cellWidth - 8;
    const cellH = DEFAULT_FLOOR_GRID.cellHeight - 6;

    // Recuadro verde menta suave con borde brillante
    this.gridHighlightGraphics
      .roundRect(
        nearestCell.x - cellW / 2,
        nearestCell.y - cellH / 2,
        cellW,
        cellH,
        8
      )
      .fill({ color: 0x4caf50, alpha: 0.22 })
      .stroke({ color: 0x4caf50, width: 2.5, alpha: 0.85 });

    // Punto central magnético
    this.gridHighlightGraphics
      .circle(nearestCell.x, nearestCell.y, 4)
      .fill({ color: 0x4caf50, alpha: 0.9 });
  }

  /**
   * Limpia el indicador de celda resaltada.
   */
  clearGridHighlight(): void {
    this.gridHighlightGraphics.clear();
  }

  /**
   * Dibuja la pared con papel tapiz cálido, cornisa moldurada y sombreado de esquinas de diorama.
   */
  private renderWall(): void {
    this.wallGraphics.clear();

    const wallHeight = 310;

    // 1. Base del papel tapiz cálido marfil
    this.wallGraphics.rect(0, 0, 800, wallHeight).fill({ color: 0xfffcf5 });

    // 2. Franjas verticales de papel tapiz con detalles estilizados
    const stripeWidth = 24;
    const stripeGap = 24;
    for (let x = 0; x < 800; x += stripeWidth + stripeGap) {
      this.wallGraphics
        .rect(x, 18, stripeWidth, wallHeight - 18)
        .fill({ color: 0xf5ebd7, alpha: 0.55 });

      // Pequeño motivo decorativo victoriano en el centro de la franja
      for (let y = 50; y < wallHeight - 30; y += 70) {
        this.wallGraphics
          .circle(x + stripeWidth / 2, y, 2.5)
          .fill({ color: 0xe5d4ba, alpha: 0.6 });
      }
    }

    // 3. Sombreado de esquinas laterales (profundidad de corte diorama)
    // Esquina izquierda
    this.wallGraphics.rect(0, 0, 8, wallHeight).fill({ color: 0x7a5229, alpha: 0.12 });
    this.wallGraphics.rect(8, 0, 14, wallHeight).fill({ color: 0x7a5229, alpha: 0.06 });
    // Esquina derecha
    this.wallGraphics.rect(792, 0, 8, wallHeight).fill({ color: 0x7a5229, alpha: 0.12 });
    this.wallGraphics.rect(778, 0, 14, wallHeight).fill({ color: 0x7a5229, alpha: 0.06 });

    // 4. Cornisa superior de techo moldurada (crown molding tridimensional)
    this.wallGraphics.rect(0, 0, 800, 8).fill({ color: 0xf8f3eb });
    this.wallGraphics.rect(0, 8, 800, 4).fill({ color: 0xede2d1 });
    this.wallGraphics.rect(0, 12, 800, 4).fill({ color: 0xfbf8f2 });
    this.wallGraphics.rect(0, 16, 800, 2).fill({ color: 0xd9ccb8 });
  }

  /**
   * Dibuja una ventana de casa de muñecas con paisaje exterior y cortinas drapeadas.
   */
  private renderWindow(): void {
    this.windowGraphics.clear();

    const winX = 400;
    const winY = 145;
    const winW = 148;
    const winH = 165;
    const left = winX - winW / 2;
    const top = winY - winH / 2;

    // 1. Sombra suave arrojada por el marco sobre el papel tapiz
    this.windowGraphics
      .roundRect(left - 10, top - 6, winW + 20, winH + 18, 30)
      .fill({ color: 0x000000, alpha: 0.08 });

    // 2. Marco exterior blanco arqueado
    this.windowGraphics
      .roundRect(left - 8, top - 8, winW + 16, winH + 16, 26)
      .fill({ color: 0xffffff })
      .stroke({ color: 0xdcd3c3, width: 2.5 });

    // 3. Interior de la ventana: cielo azul luminoso
    this.windowGraphics.roundRect(left, top, winW, winH, 20).fill({ color: 0x98d4f8 });

    // Sol suave en el horizonte
    this.windowGraphics.circle(winX + 42, top + 38, 22).fill({ color: 0xfff4cc, alpha: 0.6 });
    this.windowGraphics.circle(winX + 42, top + 38, 14).fill({ color: 0xffe28a });

    // Colinas verdes lejanas en capas
    this.windowGraphics
      .ellipse(winX - 30, top + winH + 8, winW * 0.45, 45)
      .fill({ color: 0x81c784 });
    this.windowGraphics
      .ellipse(winX + 40, top + winH + 12, winW * 0.5, 52)
      .fill({ color: 0x4caf50 });

    // Nubes esponjosas procedimentales
    this.windowGraphics.circle(left + 35, top + 42, 14).fill({ color: 0xffffff });
    this.windowGraphics.circle(left + 48, top + 38, 18).fill({ color: 0xffffff });
    this.windowGraphics.circle(left + 62, top + 44, 12).fill({ color: 0xffffff });

    // 4. Cruceta de parteluces de madera blanca
    this.windowGraphics.rect(winX - 3, top, 6, winH).fill({ color: 0xffffff });
    this.windowGraphics.rect(left, top + winH * 0.48 - 3, winW, 6).fill({ color: 0xffffff });

    // 5. Cortinas laterales estilo Pet Society en tono pastel melocotón
    // Cortina izquierda
    this.windowGraphics
      .poly([left - 2, top + 4, left + 28, top + 4, left + 14, top + winH - 10, left - 2, top + winH - 10])
      .fill({ color: 0xffccd5 });
    // Abrazadera dorada izquierda
    this.windowGraphics.circle(left + 16, top + winH * 0.55, 4).fill({ color: 0xd4af37 });

    // Cortina derecha
    this.windowGraphics
      .poly([
        left + winW + 2,
        top + 4,
        left + winW - 28,
        top + 4,
        left + winW - 14,
        top + winH - 10,
        left + winW + 2,
        top + winH - 10,
      ])
      .fill({ color: 0xffccd5 });
    // Abrazadera dorada derecha
    this.windowGraphics.circle(left + winW - 16, top + winH * 0.55, 4).fill({ color: 0xd4af37 });

    // 6. Alféizar / Repisa inferior moldurada
    this.windowGraphics
      .roundRect(left - 18, top + winH - 4, winW + 36, 16, 4)
      .fill({ color: 0xffffff })
      .stroke({ color: 0xdcd3c3, width: 2 });
    this.windowGraphics
      .rect(left - 14, top + winH + 12, winW + 28, 4)
      .fill({ color: 0x8a6237, alpha: 0.16 });
  }

  /**
   * Dibuja el zócalo / rodapié moldurado con relieve realista y sombra de contacto sobre el suelo.
   */
  private renderBaseboard(): void {
    this.baseboardGraphics.clear();

    const startY = 310;

    // 1. Moldura superior con bisel
    this.baseboardGraphics.rect(0, startY, 800, 3).fill({ color: 0xffffff });
    this.baseboardGraphics.rect(0, startY + 3, 800, 3).fill({ color: 0xeee7dc });

    // 2. Tablón central principal del rodapié lacado marfil
    this.baseboardGraphics.rect(0, startY + 6, 800, 18).fill({ color: 0xf8f5ee });

    // 3. Moldura de base inferior
    this.baseboardGraphics.rect(0, startY + 24, 800, 6).fill({ color: 0xe2dacb });

    // 4. Sombra profunda de contacto arrojada sobre los tablones del suelo
    this.baseboardGraphics.rect(0, startY + 30, 800, 6).fill({ color: 0x5a3615, alpha: 0.32 });
    this.baseboardGraphics.rect(0, startY + 36, 800, 6).fill({ color: 0x5a3615, alpha: 0.12 });
  }

  /**
   * Dibuja el suelo de parquet de madera en perspectiva 2.5D con juntas escalonadas
   * y remate frontal de corte diorama.
   */
  private renderFloor(): void {
    this.floorGraphics.clear();

    const floorStartY = 340;
    const floorStageCutY = 574;

    // 1. Color base de madera cálida
    this.floorGraphics.rect(0, floorStartY, 800, 600 - floorStartY).fill({ color: 0xdeb887 });

    // 2. Tablones horizontales con variación de tono y altura creciente (perspectiva 2.5D)
    const rowHeights = [48, 54, 62, 70];
    const rowOffsets = [140, 70, 180, 90];
    let currentY = floorStartY;

    for (let r = 0; r < rowHeights.length; r++) {
      const h = rowHeights[r];

      // Alternancia sutil de tinte de madera
      if (r % 2 === 1) {
        this.floorGraphics.rect(0, currentY, 800, h).fill({ color: 0xe6c79e, alpha: 0.35 });
      }

      // Juntas verticales escalonadas entre tablones
      const offset = rowOffsets[r];
      for (let x = offset; x < 800; x += 200) {
        // Línea oscura de junta
        this.floorGraphics.rect(x, currentY, 2, h).fill({ color: 0x8a5a2b, alpha: 0.75 });
        // Línea de brillo en el borde adyacente del tablón
        this.floorGraphics.rect(x + 2, currentY, 1, h).fill({ color: 0xffffff, alpha: 0.35 });
      }

      // Línea divisoria horizontal entre filas de tablones con bisel de luz
      this.floorGraphics.rect(0, currentY + h - 2, 800, 2).fill({ color: 0x8a5a2b });
      this.floorGraphics.rect(0, currentY + h, 800, 1).fill({ color: 0xffffff, alpha: 0.4 });

      currentY += h;
    }

    // 3. Sombreado de los laterales del suelo (esquinas diorama)
    this.floorGraphics.rect(0, floorStartY, 12, floorStageCutY - floorStartY).fill({
      color: 0x4a2a10,
      alpha: 0.15,
    });
    this.floorGraphics.rect(788, floorStartY, 12, floorStageCutY - floorStartY).fill({
      color: 0x4a2a10,
      alpha: 0.15,
    });

    // 4. Borde frontal de corte diorama (Stage Cutaway Rim) en la base de la pantalla
    // Borde brillante biselado superior
    this.floorGraphics.rect(0, floorStageCutY, 800, 2).fill({ color: 0xf6dbbe });
    // Grosor del corte transversal de la base de madera (caoba oscura)
    this.floorGraphics.rect(0, floorStageCutY + 2, 800, 24).fill({ color: 0x5a3212 });
    this.floorGraphics.rect(0, floorStageCutY + 8, 800, 2).fill({ color: 0x43240b });
  }

  /**
   * Dibuja las marcas y guías visuales sutiles de la rejilla magnética sobre el suelo.
   */
  private renderGridGuides(): void {
    this.gridGraphics.clear();

    const cellW = DEFAULT_FLOOR_GRID.cellWidth - 8;
    const cellH = DEFAULT_FLOOR_GRID.cellHeight - 6;

    for (const cell of DEFAULT_FLOOR_GRID.cells) {
      // Recuadro blanco translúcido redondeado
      this.gridGraphics
        .roundRect(cell.x - cellW / 2, cell.y - cellH / 2, cellW, cellH, 8)
        .stroke({ color: 0xffffff, width: 1.5, alpha: 0.35 })
        .fill({ color: 0xffffff, alpha: 0.05 });

      // Punto central sutil
      this.gridGraphics.circle(cell.x, cell.y, 2.5).fill({ color: 0xffffff, alpha: 0.35 });
    }
  }

  override destroy(options?: DestroyOptions): void {
    super.destroy(options ?? { children: true });
  }
}
