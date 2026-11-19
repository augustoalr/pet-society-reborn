import { Container, Graphics, Ticker, type DestroyOptions } from 'pixi.js';
import type { PetAppearance, PetClothes } from '../../domain';
import {
  drawBackEars,
  drawBody,
  drawClothes,
  drawEyes,
  drawFrontEars,
  drawHead,
  drawMouthAndCheeks,
} from './layerDrawers';
import { getPetColorPalette } from './palette';
import { PET_LAYER_NAMES, PET_LAYER_ORDER, type PetLayerIndex } from './types';

/**
 * Normaliza la entrada de ropa admitiendo tanto el objeto inmutable `PetClothes`
 * como una lista de strings de IDs de prendas.
 */
function normalizeClothes(input?: PetClothes | readonly string[]): PetClothes {
  if (!input) {
    return {};
  }
  if (Array.isArray(input)) {
    let hat: string | null = null;
    let shirt: string | null = null;
    let accessory: string | null = null;
    for (const item of input) {
      if (item.includes('hat') || item.includes('cap')) {
        hat = item;
      } else if (item.includes('shirt')) {
        shirt = item;
      } else {
        accessory = item;
      }
    }
    return { hat, shirt, accessory };
  }
  return input as PetClothes;
}

/**
 * Vista compuesta y modular de la mascota en PixiJS v8.
 *
 * Encapsula la jerarquía estricta de capas procedimentales (Layer Order)
 * y proporciona actualización reactiva de apariencia y animación idle
 * sin regenerar nodos en el árbol de PixiJS (R-01, R-02, R-04).
 */
export class PetView extends Container {
  private currentAppearance: PetAppearance;
  private currentClothes: PetClothes;

  // Capas de renderizado en orden canónico estricto
  private readonly backEarsLayer = new Graphics();
  private readonly bodyLayer = new Graphics();
  private readonly headLayer = new Graphics();
  private readonly frontEarsLayer = new Graphics();
  private readonly eyesLayer = new Graphics();
  private readonly mouthCheeksLayer = new Graphics();
  private readonly clothesLayer = new Graphics();

  private readonly layersList: readonly Graphics[];

  // Animación idle
  private activeTicker: Ticker | null = null;
  private idleTimer = 0;
  private readonly onTick = (ticker: Ticker) => this.handleIdleTick(ticker);

  constructor(
    appearance: PetAppearance = {
      color: 'pink',
      eyes: 'round',
      mouth: 'smile',
      ears: 'floppy',
    },
    clothes?: PetClothes | readonly string[]
  ) {
    super();

    this.currentAppearance = appearance;
    this.currentClothes = normalizeClothes(clothes);

    // Asignación de nombres para depuración e inspección de PixiJS
    this.backEarsLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.BACK_EARS];
    this.bodyLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.BODY];
    this.headLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.HEAD];
    this.frontEarsLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.FRONT_EARS];
    this.eyesLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.EYES];
    this.mouthCheeksLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.MOUTH_AND_CHEEKS];
    this.clothesLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.CLOTHES];

    this.layersList = [
      this.backEarsLayer,
      this.bodyLayer,
      this.headLayer,
      this.frontEarsLayer,
      this.eyesLayer,
      this.mouthCheeksLayer,
      this.clothesLayer,
    ] as const;

    // Agregar hijos en orden estricto de capas
    for (const layer of this.layersList) {
      this.addChild(layer);
    }

    // Renderizado inicial
    this.renderAllLayers();
  }

  /** Apariencia actual inmutable de la mascota. */
  get appearance(): PetAppearance {
    return this.currentAppearance;
  }

  /** Ropa y accesorios actualmente equipados. */
  get clothes(): PetClothes {
    return this.currentClothes;
  }

  /** Total de capas compuestas en el contenedor. */
  get layerCount(): number {
    return this.layersList.length;
  }

  /**
   * Obtiene la capa gráfica correspondiente a un índice de orden de capa.
   */
  getLayer(layerIndex: PetLayerIndex): Graphics {
    const layer = this.layersList[layerIndex];
    if (!layer) {
      throw new Error(`Índice de capa no válido: ${layerIndex}`);
    }
    return layer;
  }

  /**
   * Actualiza la apariencia y ropa de la mascota en tiempo real.
   * Redibuja las capas de forma eficiente sin recrear los nodos del árbol.
   */
  updateAppearance(
    appearance: PetAppearance,
    clothes?: PetClothes | readonly string[]
  ): void {
    this.currentAppearance = appearance;
    if (clothes !== undefined) {
      this.currentClothes = normalizeClothes(clothes);
    }
    this.renderAllLayers();
  }

  /**
   * Establece la posición central de la mascota en el espacio virtual del juego.
   */
  setPosition(x: number, y: number): void {
    this.position.set(x, y);
  }

  /**
   * Inicia la animación idle suave (respiración y balanceo) utilizando el Ticker de PixiJS.
   *
   * @param ticker Ticker a utilizar (opcional, por defecto `Ticker.shared`).
   */
  startIdleAnimation(ticker: Ticker = Ticker.shared): void {
    if (this.activeTicker) {
      this.stopIdleAnimation();
    }
    this.activeTicker = ticker;
    this.activeTicker.add(this.onTick);
  }

  /**
   * Detiene la animación idle y restablece las transformaciones a su posición neutral.
   */
  stopIdleAnimation(): void {
    if (this.activeTicker) {
      this.activeTicker.remove(this.onTick);
      this.activeTicker = null;
    }
    this.resetTransforms();
  }

  /**
   * Limpia recursos y detiene animaciones activas.
   */
  override destroy(options?: DestroyOptions): void {
    this.stopIdleAnimation();
    super.destroy(options ?? { children: true });
  }

  /**
   * Redibuja proceduralmente cada capa con la paleta y estilos activos.
   */
  private renderAllLayers(): void {
    const palette = getPetColorPalette(this.currentAppearance.color);

    drawBackEars(this.backEarsLayer, this.currentAppearance.ears, palette);
    drawBody(this.bodyLayer, palette);
    drawHead(this.headLayer, palette);
    drawFrontEars(this.frontEarsLayer, this.currentAppearance.ears, palette);
    drawEyes(this.eyesLayer, this.currentAppearance.eyes, palette);
    drawMouthAndCheeks(this.mouthCheeksLayer, this.currentAppearance.mouth);
    drawClothes(this.clothesLayer, this.currentClothes);
  }

  /**
   * Actualiza las transformaciones sutiles en cada tick de animación.
   */
  private handleIdleTick(ticker: Ticker): void {
    const delta = ticker.deltaTime || 1;
    this.idleTimer += 0.05 * delta;

    // Respiración del torso: pequeña variación en escala Y y X
    const breath = Math.sin(this.idleTimer) * 0.02;
    this.bodyLayer.scale.set(1 + breath * 0.4, 1 + breath);

    // Balanceo suave de la cabeza y rasgos faciales (sube y baja sutilmente ~1.2px)
    const bob = Math.sin(this.idleTimer) * 1.2;

    this.headLayer.y = bob;
    this.frontEarsLayer.y = bob;
    this.eyesLayer.y = bob;
    this.mouthCheeksLayer.y = bob;

    // Las orejas traseras acompañan el movimiento de la cabeza
    if (this.currentAppearance.ears !== 'floppy') {
      this.backEarsLayer.y = bob;
    } else {
      this.backEarsLayer.y = 0;
    }

    // Los accesorios y sombrero acompañan a la cabeza
    this.clothesLayer.y = bob;
  }

  /**
   * Restablece las posiciones y escalas a cero/neutro.
   */
  private resetTransforms(): void {
    this.bodyLayer.scale.set(1, 1);
    this.headLayer.y = 0;
    this.frontEarsLayer.y = 0;
    this.eyesLayer.y = 0;
    this.mouthCheeksLayer.y = 0;
    this.backEarsLayer.y = 0;
    this.clothesLayer.y = 0;
  }
}
