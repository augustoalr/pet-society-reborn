import { Application } from 'pixi.js';
import type { PetAppearance, PetClothes } from '../../domain';
import { PetView } from '../pet';
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
 * - Escalar el lienzo manteniendo la resolución virtual fija (R-09).
 * - Abstraer los eventos de puntero (mouse + touch unificados).
 */
export class PixiGameEngine {
  private app: Application | null = null;
  private container: HTMLElement | null = null;
  private petView: PetView | null = null;
  private currentScale = 1;
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
      backgroundColor: 0x87CEEB, // Cielo azul claro — fondo por defecto del juego
    });

    container.appendChild(this.app.canvas);

    // Configura interactividad en el stage para capturar eventos de puntero
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = {
      contains: () => true,
    };

    this.setupPointerEvents();

    // Inicializa la mascota centrada en el escenario virtual por defecto (T-04)
    this.spawnPet();

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
      return this.petView;
    }

    this.petView = new PetView(appearance, clothes);
    this.petView.setPosition(position.x, position.y);
    this.petView.startIdleAnimation();
    this.app.stage.addChild(this.petView);
    return this.petView;
  }

  /**
   * Actualiza reactivamente la apariencia de la mascota activa.
   */
  updatePetAppearance(
    appearance: PetAppearance,
    clothes?: PetClothes | readonly string[]
  ): void {
    if (!this.petView && this.app) {
      this.spawnPet(appearance, clothes);
      return;
    }
    this.petView?.updateAppearance(appearance, clothes);
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

    if (this.petView) {
      this.petView.destroy();
      this.petView = null;
    }

    this.pointerHandlers.clear();

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
