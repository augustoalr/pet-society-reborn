import { Application } from 'pixi.js';
import type { BallGameState, PetAppearance, PetClothes, Room } from '../../domain';
import { PetView } from '../pet';
import { RoomView, FurnitureView } from '../room';
import { BallGameView } from '../minigame';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT, calculateViewportScale } from '../viewport';
import type { GamePointerEventType, GamePointerEvent, GamePointerEventHandler } from './types';

/**
 * Wrapper del motor gráfico que encapsula toda la interacción con PixiJS v8.
 *
 * El resto de la aplicación nunca importa `pixi.js` directamente;
 * accede al motor a través de esta clase (R-02: Wrappers Obligatorios).
 *
 * Responsabilidades:
 * - Inicializar y destruir la aplicación WebGL de forma segura.
 * - Renderizar la habitación procedimental (fondo, zócalo y suelo).
 * - Gestionar la mascota y los muebles colocados con z-sorting automático.
 * - Escalar el lienzo manteniendo la resolución virtual fija (800x600).
 * - Abstraer los eventos de puntero (mouse + touch unificados) y arrastre de muebles.
 */
export class PixiGameEngine {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private roomView: RoomView | null = null;
  private petView: PetView | null = null;
  private readonly furnitureViews = new Map<string, FurnitureView>();
  private ballGameView: BallGameView | null = null;

  private gameMode: 'room' | 'minigame' = 'room';
  private currentPetAppearance: PetAppearance = {
    color: 'pink',
    eyes: 'round',
    mouth: 'smile',
    ears: 'floppy',
  };
  private currentPetClothes?: PetClothes | readonly string[];

  private currentScale = 1;
  private decoratingMode = false;
  private selectedFurnitureId: string | null = null;

  private petClickHandler: (() => void) | null = null;
  private furnitureMovedHandler: ((itemId: string, position: { x: number; y: number }) => void) | null = null;
  private furnitureSelectedHandler: ((itemId: string | null) => void) | null = null;
  private minigameScoreHandler: ((score: number, combo: number) => void) | null = null;
  private minigameGameOverHandler: ((finalScore: number, coinsEarned: number) => void) | null = null;
  private minigameHitHandler: ((combo: number) => void) | null = null;
  private minigameStateChangeHandler: ((state: BallGameState) => void) | null = null;
  private readonly pointerHandlers = new Map<GamePointerEventType, Set<GamePointerEventHandler>>();

  /** Indica si el motor está inicializado y listo para renderizar. */
  get isInitialized(): boolean {
    return this.app !== null;
  }

  /** Factor de escala uniforme actual aplicado al contenido virtual. */
  get scale(): number {
    return this.currentScale;
  }

  /** Elemento HTML contenedor donde se montó el canvas. */
  get hostContainer(): HTMLElement | null {
    return this.container;
  }

  /** Referencia al escenario principal (stage) de PixiJS para agregar hijos. */
  get stage(): Application['stage'] | null {
    return this.app?.stage ?? null;
  }

  /** Referencia a la vista de la mascota renderizada en el escenario virtual. */
  get pet(): PetView | null {
    return this.petView;
  }

  /** Referencia a la capa de fondo de la habitación. */
  get room(): RoomView | null {
    return this.roomView;
  }

  /** Lista de vistas de muebles colocados en la habitación. */
  get furniture(): readonly FurnitureView[] {
    return Array.from(this.furnitureViews.values());
  }

  /** Indica si el modo decoración está activo. */
  get isDecorating(): boolean {
    return this.decoratingMode;
  }

  /** Identificador del mueble actualmente seleccionado o null. */
  get selectedFurniture(): string | null {
    return this.selectedFurnitureId;
  }

  /** Modo de juego activo ('room' o 'minigame'). */
  get mode(): 'room' | 'minigame' {
    return this.gameMode;
  }

  /** Referencia a la vista del minijuego de pelota exterior. */
  get ballGame(): BallGameView | null {
    return this.ballGameView;
  }

  /**
   * Configura el callback al cambiar la puntuación o el combo del minijuego.
   */
  setMinigameScoreHandler(handler: ((score: number, combo: number) => void) | null): void {
    this.minigameScoreHandler = handler;
  }

  /**
   * Configura el callback al finalizar la partida del minijuego.
   */
  setMinigameGameOverHandler(
    handler: ((finalScore: number, coinsEarned: number) => void) | null
  ): void {
    this.minigameGameOverHandler = handler;
  }

  /**
   * Configura el callback al asestar un golpe válido a la pelota en el minijuego.
   */
  setMinigameHitHandler(handler: ((combo: number) => void) | null): void {
    this.minigameHitHandler = handler;
  }

  /**
   * Configura el callback de sincronización de estado completo del minijuego.
   */
  setMinigameStateChangeHandler(handler: ((state: BallGameState) => void) | null): void {
    this.minigameStateChangeHandler = handler;
  }

  /**
   * Configura el callback al hacer clic o tocar sobre la mascota.
   */
  setPetClickHandler(handler: (() => void) | null): void {
    this.petClickHandler = handler;
  }

  /**
   * Configura el callback al soltar un mueble tras ser arrastrado.
   */
  setFurnitureMovedHandler(
    handler: ((itemId: string, position: { x: number; y: number }) => void) | null
  ): void {
    this.furnitureMovedHandler = handler;
  }

  /**
   * Configura el callback al seleccionar un mueble en el escenario.
   */
  setFurnitureSelectedHandler(handler: ((itemId: string | null) => void) | null): void {
    this.furnitureSelectedHandler = handler;
  }

  /**
   * Inicializa la aplicación de PixiJS v8 y la monta en el contenedor DOM.
   *
   * @param container Elemento HTML donde se insertará el canvas WebGL.
   * @throws Error si el motor ya fue inicializado.
   */
  async initialize(container: HTMLElement): Promise<void> {
    if (this.app) {
      throw new Error('PixiGameEngine ya está inicializado. Llama a destroy() primero.');
    }

    this.container = container;
    this.app = new Application();

    await this.app.init({
      width: VIRTUAL_WIDTH,
      height: VIRTUAL_HEIGHT,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x87ceeb, // Cielo azul claro — fondo por defecto
    });

    container.appendChild(this.app.canvas);

    // Habilitar ordenamiento automático de profundidad por zIndex en el escenario
    this.app.stage.sortableChildren = true;

    // Configura interactividad en el stage para capturar eventos de puntero
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = {
      contains: () => true,
    };

    this.setupPointerEvents();

    // 1. Capa de fondo de la habitación (pared, zócalo y suelo) con zIndex muy bajo
    this.roomView = new RoomView();
    this.roomView.zIndex = -10000;
    this.app.stage.addChild(this.roomView);

    // 2. Inicializa la mascota centrada en el escenario virtual por defecto (T-04)
    this.spawnPet();

    // 3. Inicializa el minijuego de pelota en el jardín exterior (T-09)
    this.ballGameView = new BallGameView({
      appearance: this.currentPetAppearance,
      clothes: this.currentPetClothes,
      onScoreChange: (score, combo) => {
        this.minigameScoreHandler?.(score, combo);
      },
      onGameOver: (finalScore, coinsEarned) => {
        this.minigameGameOverHandler?.(finalScore, coinsEarned);
      },
      onHitSuccess: (combo) => {
        this.minigameHitHandler?.(combo);
      },
      onStateChange: (state) => {
        this.minigameStateChangeHandler?.(state);
      },
    });
    this.ballGameView.visible = false;
    this.ballGameView.zIndex = 5000;
    this.app.stage.addChild(this.ballGameView);

    // Ajuste inicial al tamaño del contenedor
    this.resize(container.clientWidth, container.clientHeight);
  }

  /**
   * Instancia o reposiciona la mascota en el escenario virtual.
   *
   * @param appearance Configuración visual (color, ojos, boca, orejas).
   * @param clothes Ropa o accesorios opcionales.
   * @param position Coordenadas en el espacio virtual (centro por defecto: 400, 350).
   */
  spawnPet(
    appearance: PetAppearance = {
      color: 'pink',
      eyes: 'round',
      mouth: 'smile',
      ears: 'floppy',
    },
    clothes?: PetClothes | readonly string[],
    position: { x: number; y: number } = { x: 400, y: 350 }
  ): PetView {
    if (!this.app) {
      throw new Error('PixiGameEngine no está inicializado.');
    }

    if (this.petView) {
      this.petView.updateAppearance(appearance, clothes);
      this.petView.setPosition(position.x, position.y);
      this.petView.zIndex = Math.round(position.y + 45);
      this.sortWorldDepth();
      return this.petView;
    }

    this.petView = new PetView(appearance, clothes);
    this.petView.setPosition(position.x, position.y);
    this.petView.zIndex = Math.round(position.y + 45);
    this.petView.eventMode = 'static';
    this.petView.cursor = 'pointer';
    this.petView.on('pointerdown', (event) => {
      // En modo decoración se prioriza la manipulación de la sala
      if (this.decoratingMode) {
        return;
      }
      event.stopPropagation();
      this.petClickHandler?.();
    });
    this.petView.startIdleAnimation();
    this.app.stage.addChild(this.petView);
    this.sortWorldDepth();
    return this.petView;
  }

  /**
   * Actualiza reactivamente la apariencia de la mascota activa.
   */
  updatePetAppearance(
    appearance: PetAppearance,
    clothes?: PetClothes | readonly string[]
  ): void {
    this.currentPetAppearance = appearance;
    this.currentPetClothes = clothes;

    if (!this.petView && this.app) {
      this.spawnPet(appearance, clothes);
    } else {
      this.petView?.updateAppearance(appearance, clothes);
    }

    this.ballGameView?.updatePetAppearance(appearance, clothes);
  }

  /**
   * Cambia el modo de juego activo entre la habitación ('room') y el minijuego de pelota ('minigame').
   */
  setGameMode(mode: 'room' | 'minigame'): void {
    if (this.gameMode === mode) {
      return;
    }
    this.gameMode = mode;

    if (mode === 'room') {
      if (this.roomView) {
        this.roomView.visible = true;
      }
      for (const view of this.furnitureViews.values()) {
        view.visible = true;
      }
      if (this.petView) {
        this.petView.visible = true;
        this.petView.setPosition(400, 350);
      }
      if (this.ballGameView) {
        this.ballGameView.visible = false;
        this.ballGameView.pause();
      }
    } else {
      if (this.roomView) {
        this.roomView.visible = false;
      }
      for (const view of this.furnitureViews.values()) {
        view.visible = false;
      }
      if (this.petView) {
        this.petView.visible = false;
      }
      if (this.ballGameView) {
        this.ballGameView.visible = true;
        this.ballGameView.updatePetAppearance(
          this.currentPetAppearance,
          this.currentPetClothes
        );
        this.ballGameView.resume();
      }
    }
  }

  /**
   * Reinicia la ronda del minijuego de pelota.
   */
  restartBallGame(highScore?: number): void {
    this.ballGameView?.resetGame(highScore);
  }

  /**
   * Sincroniza la lista de muebles colocados en la habitación con el estado del juego.
   */
  syncRoom(room?: Room | null): void {
    if (!this.app || !room) {
      return;
    }

    const currentItemIds = new Set(room.placedItems.map((item) => item.itemId));

    // 1. Eliminar muebles retirados
    for (const [id, view] of this.furnitureViews.entries()) {
      if (!currentItemIds.has(id)) {
        this.app.stage.removeChild(view);
        view.destroy();
        this.furnitureViews.delete(id);
      }
    }

    // 2. Crear nuevos muebles o sincronizar existentes
    for (const placedItem of room.placedItems) {
      const existingView = this.furnitureViews.get(placedItem.itemId);

      if (existingView) {
        // No sobrescribir posición si el usuario lo está arrastrando en este instante
        if (!existingView.dragging) {
          existingView.setPosition(placedItem.x, placedItem.y);
        }
      } else {
        const newView = new FurnitureView(
          placedItem.itemId,
          placedItem.x,
          placedItem.y
        );
        newView.setDecoratingMode(this.decoratingMode);
        newView.setSelected(this.selectedFurnitureId === placedItem.itemId);

        newView.setOnMoveEnd((pos) => {
          this.furnitureMovedHandler?.(placedItem.itemId, pos);
        });

        newView.setOnSelect(() => {
          this.selectedFurnitureId = placedItem.itemId;
          this.furnitureSelectedHandler?.(placedItem.itemId);
        });

        newView.setOnDepthChange(() => {
          this.sortWorldDepth();
        });

        this.app.stage.addChild(newView);
        this.furnitureViews.set(placedItem.itemId, newView);
      }
    }

    this.sortWorldDepth();
  }

  /**
   * Activa o desactiva el modo de decoración.
   * Permite mover muebles arrastrándolos y visualizarlos con indicadores de selección.
   */
  setDecoratingMode(enabled: boolean): void {
    this.decoratingMode = enabled;
    for (const view of this.furnitureViews.values()) {
      view.setDecoratingMode(enabled);
    }
    if (!enabled) {
      this.selectFurniture(null);
    }
  }

  /**
   * Selecciona un mueble específico o deselecciona todos con null.
   */
  selectFurniture(itemId: string | null): void {
    this.selectedFurnitureId = itemId;
    for (const [id, view] of this.furnitureViews.entries()) {
      view.setSelected(id === itemId);
    }
    this.furnitureSelectedHandler?.(itemId);
  }

  /**
   * Ordena los nodos hijos del escenario por zIndex para mantener profundidad correcta.
   */
  sortWorldDepth(): void {
    if (!this.app) {
      return;
    }
    this.app.stage.sortChildren();
  }

  /**
   * Redimensiona el canvas al tamaño del contenedor disponible,
   * aplicando escalado uniforme con letterbox/pillarbox.
   */
  resize(containerWidth: number, containerHeight: number): void {
    if (!this.app) {
      return;
    }

    const viewport = calculateViewportScale(containerWidth, containerHeight);

    this.app.renderer.resize(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    const canvas = this.app.canvas as HTMLCanvasElement;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    canvas.style.marginLeft = `${viewport.offsetX}px`;
    canvas.style.marginTop = `${viewport.offsetY}px`;

    this.currentScale = viewport.scale;
  }

  /**
   * Registra un handler para eventos de puntero unificados (mouse + touch).
   * Los eventos se despachan con coordenadas en el espacio virtual del juego.
   */
  onPointerEvent(type: GamePointerEventType, handler: GamePointerEventHandler): void {
    if (!this.pointerHandlers.has(type)) {
      this.pointerHandlers.set(type, new Set());
    }
    this.pointerHandlers.get(type)!.add(handler);
  }

  /**
   * Elimina un handler de eventos de puntero previamente registrado.
   */
  offPointerEvent(type: GamePointerEventType, handler: GamePointerEventHandler): void {
    this.pointerHandlers.get(type)?.delete(handler);
  }

  /**
   * Destruye la aplicación de PixiJS y limpia recursos WebGL para evitar fugas de memoria.
   */
  destroy(): void {
    if (!this.app) {
      return;
    }

    for (const view of this.furnitureViews.values()) {
      view.destroy();
    }
    this.furnitureViews.clear();

    if (this.roomView) {
      this.roomView.destroy();
      this.roomView = null;
    }

    if (this.petView) {
      this.petView.destroy();
      this.petView = null;
    }

    if (this.ballGameView) {
      this.ballGameView.destroy();
      this.ballGameView = null;
    }

    this.pointerHandlers.clear();
    this.petClickHandler = null;
    this.furnitureMovedHandler = null;
    this.furnitureSelectedHandler = null;
    this.minigameScoreHandler = null;
    this.minigameGameOverHandler = null;
    this.minigameHitHandler = null;
    this.minigameStateChangeHandler = null;

    this.app.destroy(true, { children: true });
    this.app = null;
    this.container = null;
    this.currentScale = 1;
  }

  /**
   * Configura la escucha de eventos de puntero sobre el stage de PixiJS
   * y los transforma a coordenadas del espacio virtual del juego.
   */
  private setupPointerEvents(): void {
    if (!this.app) {
      return;
    }

    const eventTypes: GamePointerEventType[] = ['pointerdown', 'pointerup', 'pointermove'];

    for (const type of eventTypes) {
      this.app.stage.on(type, (pixiEvent) => {
        const handlers = this.pointerHandlers.get(type);
        if (!handlers || handlers.size === 0) {
          return;
        }

        const globalPos = pixiEvent.global;
        const gameEvent: GamePointerEvent = {
          type,
          virtualX: globalPos.x,
          virtualY: globalPos.y,
        };

        for (const handler of handlers) {
          handler(gameEvent);
        }
      });
    }
  }
}
