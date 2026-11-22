import { Container, Graphics, type DestroyOptions, type FederatedPointerEvent } from 'pixi.js';
import {
  clampToBounds,
  DEFAULT_ROOM_BOUNDS,
  DEFAULT_FLOOR_GRID,
  getItemPlacementLayer,
  snapToGrid,
  type Bounds,
  type PlacementLayer,
  type RoomGrid,
} from '../../domain';
import { getFurnitureDefinition } from './furnitureCatalog';
import { drawFurnitureGraphics, drawFurnitureShadow } from './furnitureDrawers';

/**
 * Vista de un mueble colocado en la habitación con perspectiva 2.5D, sombras de contacto y rejilla magnética.
 *
 * Responsabilidades:
 * - Dibujado procedimental del mueble en `itemContainer`.
 * - Sombra de contacto elíptica en `shadowGraphics` anclada físicamente al suelo.
 * - Elevación táctil y escala reactiva durante el arrastre (drag & drop).
 * - Snap magnético automático a la rejilla discretizada al soltar.
 * - Discriminar comportamiento entre muebles de suelo ('floor') y decoraciones de pared ('wall').
 */
export class FurnitureView extends Container {
  readonly itemId: string;
  readonly placementLayer: PlacementLayer;

  private readonly shadowGraphics = new Graphics();
  private readonly itemContainer = new Container();
  private readonly itemGraphics = new Graphics();
  private readonly selectionGraphics = new Graphics();

  private bounds: Bounds = DEFAULT_ROOM_BOUNDS;
  private grid: RoomGrid = DEFAULT_FLOOR_GRID;

  private isDecorating = false;
  private isSelected = false;
  private isDragging = false;
  private hasMovedWhileDragging = false;
  private dragPointerStart = { x: 0, y: 0 };
  private dragItemStart = { x: 0, y: 0 };

  // Callbacks de interacción y coordinación
  private onMoveEndHandler: ((position: { x: number; y: number }) => void) | null = null;
  private onSelectHandler: (() => void) | null = null;
  private onDepthChangeHandler: (() => void) | null = null;
  private onDragStartHandler: (() => void) | null = null;
  private onDragMoveHandler: ((position: { x: number; y: number }) => void) | null = null;
  private onDragEndHandler: (() => void) | null = null;

  constructor(
    itemId: string,
    x = 0,
    y = 0,
    bounds: Bounds = DEFAULT_ROOM_BOUNDS,
    grid: RoomGrid = DEFAULT_FLOOR_GRID
  ) {
    super();

    this.itemId = itemId;
    this.placementLayer = getItemPlacementLayer(itemId);
    this.bounds = bounds;
    this.grid = grid;

    this.label = `furniture-${itemId}`;

    // Estructura jerárquica: sombra en la base (suelo) y contenedor del mueble elevado encima
    this.addChild(this.shadowGraphics);
    this.addChild(this.itemContainer);
    this.itemContainer.addChild(this.itemGraphics);
    this.itemContainer.addChild(this.selectionGraphics);

    this.setPosition(x, y);
    this.renderFurniture();
    this.renderShadow();
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

  /** Indica si el mueble se encuentra actualmente elevado respecto a su sombra en el suelo. */
  get isElevated(): boolean {
    return this.itemContainer.y < 0;
  }

  /** Referencia directa a los gráficos de la sombra de contacto. */
  get shadow(): Graphics {
    return this.shadowGraphics;
  }

  /** Indica si este mueble proyecta sombra de contacto (solo muebles de suelo). */
  get hasShadow(): boolean {
    return this.placementLayer === 'floor';
  }

  /** Rejilla magnética actualmente configurada. */
  get currentGrid(): RoomGrid {
    return this.grid;
  }

  /**
   * Configura la rejilla magnética a utilizar para el snap.
   */
  setGrid(grid: RoomGrid): void {
    this.grid = grid;
  }

  /**
   * Configura la función a invocar al iniciar un arrastre.
   */
  setOnDragStart(handler: (() => void) | null): void {
    this.onDragStartHandler = handler;
  }

  /**
   * Configura la función a invocar durante el arrastre con la posición tentativa.
   */
  setOnDragMove(handler: ((position: { x: number; y: number }) => void) | null): void {
    this.onDragMoveHandler = handler;
  }

  /**
   * Configura la función a invocar al soltar el arrastre.
   */
  setOnDragEnd(handler: (() => void) | null): void {
    this.onDragEndHandler = handler;
  }

  /**
   * Configura la función a invocar al finalizar un movimiento de arrastre con la posición final snapped.
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
      this.itemContainer.position.set(0, 0);
      this.itemContainer.scale.set(1, 1);
      this.shadowGraphics.scale.set(1, 1);
      this.shadowGraphics.alpha = 1;
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
   * Redibuja la sombra elíptica difuminada de contacto bajo la base.
   */
  private renderShadow(): void {
    this.shadowGraphics.clear();

    if (this.placementLayer !== 'floor') {
      return;
    }

    const definition = getFurnitureDefinition(this.itemId);
    const width = definition?.width ?? 80;
    drawFurnitureShadow(this.shadowGraphics, width);
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
   * Configura los eventos de puntero (mouse + touch) para el arrastre, elevación táctil y selección.
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

      // Sensación táctil: el mueble se eleva del suelo con escala reactiva
      this.itemContainer.position.set(0, -18);
      this.itemContainer.scale.set(1.08, 1.08);

      // La sombra permanece anclada en el suelo, ligeramente reducida por la distancia
      this.shadowGraphics.scale.set(0.92, 0.92);
      this.shadowGraphics.alpha = 0.8;

      this.setSelected(true);
      this.onSelectHandler?.();
      this.onDragStartHandler?.();
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
      this.zIndex = Math.round(clamped.y + 100); // Prioridad de profundidad durante el arrastre
      this.onDepthChangeHandler?.();
      this.onDragMoveHandler?.({ x: clamped.x, y: clamped.y });
    });

    const handleDragEnd = () => {
      if (!this.isDragging) return;

      this.isDragging = false;
      this.cursor = this.isDecorating ? 'grab' : 'default';

      // Restablecer elevación táctil y sombra al posarse en el suelo
      this.itemContainer.position.set(0, 0);
      this.itemContainer.scale.set(1, 1);
      this.shadowGraphics.scale.set(1, 1);
      this.shadowGraphics.alpha = 1;

      if (this.hasMovedWhileDragging) {
        // Snap magnético automático a la celda más cercana
        const snapped = snapToGrid({ x: this.x, y: this.y }, this.grid);
        this.setPosition(snapped.x, snapped.y);
        this.onMoveEndHandler?.(snapped);
      } else {
        this.zIndex = Math.round(this.y);
        this.onDepthChangeHandler?.();
      }

      this.onDragEndHandler?.();
    };

    this.on('pointerup', handleDragEnd);
    this.on('pointerupoutside', handleDragEnd);
  }

  override destroy(options?: DestroyOptions): void {
    this.onMoveEndHandler = null;
    this.onSelectHandler = null;
    this.onDepthChangeHandler = null;
    this.onDragStartHandler = null;
    this.onDragMoveHandler = null;
    this.onDragEndHandler = null;
    super.destroy(options ?? { children: true });
  }
}
