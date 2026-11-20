import { Container, Graphics, type DestroyOptions, type FederatedPointerEvent } from 'pixi.js';
import { clampToBounds, DEFAULT_ROOM_BOUNDS, type Bounds } from '../../domain';
import { getFurnitureDefinition } from './furnitureCatalog';
import { drawFurnitureGraphics } from './furnitureDrawers';

/**
 * Vista de un mueble colocado en la habitación.
 *
 * Encapsula el dibujado procedimental, la manipulación de arrastrar y soltar (drag & drop),
 * el cálculo de profundidad (z-sorting automático por coordenada Y) y la selección visual.
 */
export class FurnitureView extends Container {
  readonly itemId: string;
  private readonly itemGraphics = new Graphics();
  private readonly selectionGraphics = new Graphics();

  private bounds: Bounds = DEFAULT_ROOM_BOUNDS;
  private isDecorating = false;
  private isSelected = false;
  private isDragging = false;
  private hasMovedWhileDragging = false;
  private dragPointerStart = { x: 0, y: 0 };
  private dragItemStart = { x: 0, y: 0 };

  // Callbacks de interacción
  private onMoveEndHandler: ((position: { x: number; y: number }) => void) | null = null;
  private onSelectHandler: (() => void) | null = null;
  private onDepthChangeHandler: (() => void) | null = null;

  constructor(itemId: string, x = 0, y = 0, bounds: Bounds = DEFAULT_ROOM_BOUNDS) {
    super();

    this.itemId = itemId;
    this.bounds = bounds;

    // Etiqueta para depuración e inspección de PixiJS
    this.label = `furniture-${itemId}`;

    this.addChild(this.itemGraphics);
    this.addChild(this.selectionGraphics);

    this.setPosition(x, y);
    this.renderFurniture();
    this.setupInteraction();
  }

  /** Coordenada X actual en el espacio virtual. */
  get virtualX(): number {
    return this.x;
  }

  /** Coordenada Y actual en el espacio virtual. */
  get virtualY(): number {
    return this.y;
  }

  /** Indica si el mueble se encuentra actualmente seleccionado. */
  get selected(): boolean {
    return this.isSelected;
  }

  /** Indica si el mueble se está arrastrando activamente. */
  get dragging(): boolean {
    return this.isDragging;
  }

  /**
   * Configura la función a invocar al finalizar un movimiento de arrastre.
   */
  setOnMoveEnd(handler: ((position: { x: number; y: number }) => void) | null): void {
    this.onMoveEndHandler = handler;
  }

  /**
   * Configura la función a invocar al seleccionar o hacer clic sobre este mueble.
   */
  setOnSelect(handler: (() => void) | null): void {
    this.onSelectHandler = handler;
  }

  /**
   * Configura la función a invocar cuando cambia la coordenada Y (para reordenar z-index).
   */
  setOnDepthChange(handler: (() => void) | null): void {
    this.onDepthChangeHandler = handler;
  }

  /**
   * Establece los límites espaciales permitidos para este mueble.
   */
  setBounds(bounds: Bounds): void {
    this.bounds = bounds;
    const clamped = clampToBounds({ x: this.x, y: this.y }, this.bounds);
    this.setPosition(clamped.x, clamped.y);
  }

  /**
   * Establece la posición del mueble acotándola a los límites válidos.
   */
  setPosition(x: number, y: number): void {
    const clamped = clampToBounds({ x, y }, this.bounds);
    this.position.set(clamped.x, clamped.y);
    this.zIndex = Math.round(clamped.y);
    this.onDepthChangeHandler?.();
  }

  /**
   * Activa o desactiva el modo de decoración.
   * En modo decoración el mueble es interactivo, arrastrable y muestra cursor de agarre.
   */
  setDecoratingMode(enabled: boolean): void {
    this.isDecorating = enabled;
    if (enabled) {
      this.eventMode = 'static';
      this.cursor = this.isDragging ? 'grabbing' : 'grab';
    } else {
      this.eventMode = 'none';
      this.cursor = 'default';
      this.isDragging = false;
      this.setSelected(false);
    }
    this.updateSelectionVisuals();
  }

  /**
   * Marca o desmarca este mueble como seleccionado.
   */
  setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.updateSelectionVisuals();
  }

  /**
   * Redibuja los gráficos vectoriales del mueble.
   */
  private renderFurniture(): void {
    drawFurnitureGraphics(this.itemGraphics, this.itemId);
  }

  /**
   * Actualiza el indicador visual de selección (anillo / recuadro resaltado).
   */
  private updateSelectionVisuals(): void {
    this.selectionGraphics.clear();

    if (!this.isSelected || !this.isDecorating) {
      return;
    }

    const definition = getFurnitureDefinition(this.itemId);
    const halfWidth = definition ? definition.width / 2 + 8 : 45;
    const height = definition ? definition.height + 12 : 70;

    // Recuadro redondeado verde claro con halo de selección
    this.selectionGraphics
      .roundRect(-halfWidth, -height, halfWidth * 2, height + 8, 10)
      .stroke({ color: 0x4caf50, width: 2.5, alpha: 0.9 });

    // Puntos esquineros decorativos
    this.selectionGraphics.circle(-halfWidth, -height, 4).fill({ color: 0x4caf50 });
    this.selectionGraphics.circle(halfWidth, -height, 4).fill({ color: 0x4caf50 });
    this.selectionGraphics.circle(-halfWidth, 8, 4).fill({ color: 0x4caf50 });
    this.selectionGraphics.circle(halfWidth, 8, 4).fill({ color: 0x4caf50 });
  }

  /**
   * Configura los eventos de puntero (mouse + touch) para el arrastre y selección.
   */
  private setupInteraction(): void {
    this.on('pointerdown', (event: FederatedPointerEvent) => {
      if (!this.isDecorating) return;

      event.stopPropagation();
      this.isDragging = true;
      this.hasMovedWhileDragging = false;
      this.cursor = 'grabbing';

      this.dragPointerStart = { x: event.global.x, y: event.global.y };
      this.dragItemStart = { x: this.x, y: this.y };

      this.setSelected(true);
      this.onSelectHandler?.();
    });

    this.on('globalpointermove', (event: FederatedPointerEvent) => {
      if (!this.isDragging || !this.isDecorating) return;

      const deltaX = event.global.x - this.dragPointerStart.x;
      const deltaY = event.global.y - this.dragPointerStart.y;

      if (Math.hypot(deltaX, deltaY) > 3) {
        this.hasMovedWhileDragging = true;
      }

      const candidateX = this.dragItemStart.x + deltaX;
      const candidateY = this.dragItemStart.y + deltaY;

      const clamped = clampToBounds({ x: candidateX, y: candidateY }, this.bounds);
      this.position.set(clamped.x, clamped.y);
      this.zIndex = Math.round(clamped.y);
      this.onDepthChangeHandler?.();
    });

    const handleDragEnd = () => {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.cursor = this.isDecorating ? 'grab' : 'default';

      if (this.hasMovedWhileDragging) {
        this.onMoveEndHandler?.({ x: this.x, y: this.y });
      }
    };

    this.on('pointerup', handleDragEnd);
    this.on('pointerupoutside', handleDragEnd);
  }

  override destroy(options?: DestroyOptions): void {
    this.onMoveEndHandler = null;
    this.onSelectHandler = null;
    this.onDepthChangeHandler = null;
    super.destroy(options ?? { children: true });
  }
}
