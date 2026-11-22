import { Container, Graphics, Ticker, type DestroyOptions } from 'pixi.js';
import type { PetAppearance, PetClothes } from '../../domain';
import {
  createBlinkState,
  calculatePupilOffset,
  updateBlinkState,
  type BlinkState,
} from './gazeLogic';
import {
  drawBackEars,
  drawBody,
  drawClothes,
  drawEyes,
  drawFrontEars,
  drawHead,
  drawMouthAndCheeks,
  drawShadow,
} from './layerDrawers';
import { getPetColorPalette } from './palette';
import { PET_LAYER_NAMES, PET_LAYER_ORDER, type PetLayerIndex } from './types';
import {
  calculateWalkAnimationOffsets,
  calculateWalkStep,
  clampToFloor,
  determineFacingDirection,
} from './walkLogic';

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
 * Vista compuesta y modular de la mascota viva en PixiJS v8.
 *
 * Encapsula la jerarquía estricta de 8 capas procedimentales (Layer Order),
 * renderizado vectorial Chibi estilo Flash Playfish, deformación elástica idle
 * (squash & stretch), mirada reactiva al cursor, parpadeo natural y
 * desplazamiento por clic con animación de pasos y volteo horizontal.
 */
export class PetView extends Container {
  private currentAppearance: PetAppearance;
  private currentClothes: PetClothes;

  // Capas de renderizado en orden canónico estricto (0 a 7)
  private readonly shadowLayer = new Graphics();
  private readonly backEarsLayer = new Graphics();
  private readonly bodyLayer = new Graphics();
  private readonly headLayer = new Graphics();
  private readonly frontEarsLayer = new Graphics();
  private readonly eyesLayer = new Graphics();
  private readonly mouthCheeksLayer = new Graphics();
  private readonly clothesLayer = new Graphics();

  private readonly layersList: readonly Graphics[];

  // Animación del ciclo de vida (Ticker)
  private activeTicker: Ticker | null = null;
  private idleTimer = 0;
  private readonly onTick = (ticker: Ticker) => this.handleAnimationTick(ticker);

  // Mirada reactiva al cursor y parpadeo natural
  private cursorVirtualPos: { x: number; y: number } | null = null;
  private currentPupilOffset = { x: 0, y: 0 };
  private blinkState: BlinkState = createBlinkState();
  private currentBlinkProgress = 0;

  // Desplazamiento y caminata
  private targetDestination: { x: number; y: number } | null = null;
  private isMoving = false;
  private facingDirection: 1 | -1 = 1;
  private walkTimer = 0;
  private walkSpeed = 180; // píxeles por segundo a velocidad constante
  private onArrivalCallback: (() => void) | null = null;

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

    // Asignación de nombres canónicos para depuración e inspección
    this.shadowLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.SHADOW];
    this.backEarsLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.BACK_EARS];
    this.bodyLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.BODY];
    this.headLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.HEAD];
    this.frontEarsLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.FRONT_EARS];
    this.eyesLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.EYES];
    this.mouthCheeksLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.MOUTH_AND_CHEEKS];
    this.clothesLayer.label = PET_LAYER_NAMES[PET_LAYER_ORDER.CLOTHES];

    this.layersList = [
      this.shadowLayer,
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

    // Renderizado inicial completo
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

  /** Total de capas compuestas en el contenedor (8 capas canónicas). */
  get layerCount(): number {
    return this.layersList.length;
  }

  /** Indica si la mascota se encuentra actualmente caminando hacia un destino. */
  get isWalking(): boolean {
    return this.isMoving;
  }

  /** Dirección horizontal actual (1 = derecha, -1 = izquierda). */
  get facing(): 1 | -1 {
    return this.facingDirection;
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
   * Actualiza las coordenadas mundiales del cursor del ratón/puntero sobre el lienzo
   * para orientar suavemente las pupilas.
   *
   * @param pos Coordenadas en el espacio virtual 800x600 o null si el cursor sale del área.
   */
  setCursorPosition(pos: { x: number; y: number } | null): void {
    this.cursorVirtualPos = pos ? { x: pos.x, y: pos.y } : null;
  }

  /**
   * Ordena a la mascota desplazarse hacia unas coordenadas del suelo a velocidad constante.
   *
   * - Se orienta automáticamente (flip horizontal).
   * - Ejecuta la animación de caminar con patitas alternándose y balanceo.
   * - Al llegar, se detiene y vuelve al estado idle.
   *
   * @param targetX Coordenada X destino.
   * @param targetY Coordenada Y destino en el suelo.
   * @param onArrival Callback opcional ejecutado al completar el trayecto.
   */
  walkTo(targetX: number, targetY: number, onArrival?: () => void): void {
    const safeTarget = clampToFloor({ x: targetX, y: targetY });

    // Determinar orientación horizontal según el destino
    const newFacing = determineFacingDirection(this.x, safeTarget.x, this.facingDirection);
    this.facingDirection = newFacing;
    this.applyFacingTransform();

    this.targetDestination = safeTarget;
    this.isMoving = true;
    this.onArrivalCallback = onArrival ?? null;
  }

  /**
   * Detiene el desplazamiento en curso y restablece la postura al estado de reposo.
   */
  stopWalking(): void {
    this.isMoving = false;
    this.targetDestination = null;
    this.onArrivalCallback = null;
    this.walkTimer = 0;
    this.resetTransforms();
  }

  /**
   * Inicia el ciclo de animación (idle / caminar / mirada / parpadeo) con el Ticker de PixiJS.
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
   * Detiene la animación y restablece las transformaciones a posición neutral.
   */
  stopIdleAnimation(): void {
    if (this.activeTicker) {
      try {
        this.activeTicker.remove(this.onTick);
      } catch {
        // Ignorar si el ticker fue destruido externamente
      }
      this.activeTicker = null;
    }
    this.stopWalking();
  }

  /**
   * Limpia recursos y detiene animaciones activas.
   */
  override destroy(options?: DestroyOptions): void {
    this.stopIdleAnimation();
    this.onArrivalCallback = null;
    super.destroy(options ?? { children: true });
  }

  /**
   * Redibuja proceduralmente cada capa con la paleta y estilos activos.
   */
  private renderAllLayers(): void {
    const palette = getPetColorPalette(this.currentAppearance.color);

    drawShadow(this.shadowLayer);
    drawBackEars(this.backEarsLayer, this.currentAppearance.ears, palette);
    drawBody(this.bodyLayer, palette);
    drawHead(this.headLayer, palette);
    drawFrontEars(this.frontEarsLayer, this.currentAppearance.ears, palette);
    drawEyes(this.eyesLayer, this.currentAppearance.eyes, palette, {
      pupilOffset: this.currentPupilOffset,
      blinkProgress: this.currentBlinkProgress,
    });
    drawMouthAndCheeks(this.mouthCheeksLayer, this.currentAppearance.mouth);
    drawClothes(this.clothesLayer, this.currentClothes);
  }

  /**
   * Ciclo de actualización principal ejecutado en cada fotograma del Ticker.
   */
  private handleAnimationTick(ticker: Ticker): void {
    const delta = ticker.deltaTime || 1;
    const deltaSeconds = delta / 60;

    // 1. Desplazamiento y animación de caminar o respiración idle
    if (this.isMoving && this.targetDestination) {
      this.updateWalkCycle(deltaSeconds);
    } else {
      this.updateIdleCycle(delta);
    }

    // 2. Mirada reactiva al cursor y parpadeo natural
    this.updateGazeAndBlink(delta, deltaSeconds);
  }

  /**
   * Actualiza el desplazamiento físico y la animación orgánica de caminata.
   */
  private updateWalkCycle(deltaSeconds: number): void {
    if (!this.targetDestination) {
      return;
    }

    const stepResult = calculateWalkStep(
      { x: this.x, y: this.y },
      this.targetDestination,
      this.walkSpeed,
      deltaSeconds
    );

    this.setPosition(stepResult.currentPos.x, stepResult.currentPos.y);
    this.zIndex = Math.round(this.y + 45);
    this.parent?.sortChildren();

    if (stepResult.arrived) {
      this.isMoving = false;
      this.targetDestination = null;
      const callback = this.onArrivalCallback;
      this.onArrivalCallback = null;
      this.walkTimer = 0;
      this.resetTransforms();
      callback?.();
    } else {
      this.walkTimer += deltaSeconds * 12;
      const offsets = calculateWalkAnimationOffsets(this.walkTimer);

      // Aplicar balanceo (waddle tilt) e inclinación a las partes corporales
      this.bodyLayer.rotation = offsets.waddleTilt;
      this.headLayer.rotation = offsets.waddleTilt;
      this.frontEarsLayer.rotation = offsets.waddleTilt;
      this.backEarsLayer.rotation = offsets.waddleTilt;
      this.eyesLayer.rotation = offsets.waddleTilt;
      this.mouthCheeksLayer.rotation = offsets.waddleTilt;
      this.clothesLayer.rotation = offsets.waddleTilt;

      // Rebote vertical de la zancada
      this.bodyLayer.y = offsets.bounceY;
      this.headLayer.y = offsets.bounceY;
      this.frontEarsLayer.y = offsets.bounceY;
      this.backEarsLayer.y = offsets.bounceY;
      this.eyesLayer.y = offsets.bounceY;
      this.mouthCheeksLayer.y = offsets.bounceY;
      this.clothesLayer.y = offsets.bounceY;

      // La sombra permanece anclada en el suelo y solo modula suavemente su ancho
      this.shadowLayer.scale.set(offsets.shadowScaleX, 1);
      this.shadowLayer.y = 0;
      this.shadowLayer.rotation = 0;

      // Redibujar cuerpo con patitas alternadas
      const palette = getPetColorPalette(this.currentAppearance.color);
      drawBody(this.bodyLayer, palette, {
        leftFootY: offsets.leftFootY,
        rightFootY: offsets.rightFootY,
        leftArmY: offsets.leftArmY,
        rightArmY: offsets.rightArmY,
      });
    }
  }

  /**
   * Actualiza la deformación elástica de respiración idle (squash & stretch).
   */
  private updateIdleCycle(delta: number): void {
    this.idleTimer += 0.05 * delta;

    // Respiración del torso: squash & stretch suave
    const breath = Math.sin(this.idleTimer);
    const bodyScaleX = 1 - breath * 0.015;
    const bodyScaleY = 1 + breath * 0.025;
    this.bodyLayer.scale.set(bodyScaleX, bodyScaleY);

    // La cabeza acompaña con un retraso sutil de fase y deformación
    const headCycle = Math.sin(this.idleTimer - 0.4);
    const headBob = headCycle * 1.5;
    const headScaleX = 1 - headCycle * 0.01;
    const headScaleY = 1 + headCycle * 0.015;

    this.headLayer.scale.set(headScaleX, headScaleY);
    this.headLayer.y = headBob;

    this.frontEarsLayer.scale.set(headScaleX, headScaleY);
    this.frontEarsLayer.y = headBob;

    this.eyesLayer.y = headBob;
    this.mouthCheeksLayer.y = headBob;
    this.clothesLayer.y = headBob;

    if (this.currentAppearance.ears !== 'floppy') {
      this.backEarsLayer.y = headBob;
      this.backEarsLayer.scale.set(headScaleX, headScaleY);
    } else {
      this.backEarsLayer.y = 0;
    }

    // Sombra en el suelo: sutil dilatación sincronizada con la respiración
    const shadowScale = 1 - breath * 0.03;
    this.shadowLayer.scale.set(shadowScale, 1);
    this.shadowLayer.y = 0;
  }

  /**
   * Actualiza el seguimiento ocular hacia el cursor y el parpadeo natural periódico.
   */
  private updateGazeAndBlink(delta: number, deltaSeconds: number): void {
    // 1. Mirada reactiva al cursor con interpolación suave (lerp)
    const targetOffset = calculatePupilOffset(
      { x: this.x, y: this.y },
      this.facingDirection,
      this.cursorVirtualPos
    );

    const lerpSpeed = Math.min(1, delta * 0.18);
    const prevX = this.currentPupilOffset.x;
    const prevY = this.currentPupilOffset.y;

    this.currentPupilOffset.x += (targetOffset.x - this.currentPupilOffset.x) * lerpSpeed;
    this.currentPupilOffset.y += (targetOffset.y - this.currentPupilOffset.y) * lerpSpeed;

    const gazeMoved =
      Math.abs(this.currentPupilOffset.x - prevX) > 0.01 ||
      Math.abs(this.currentPupilOffset.y - prevY) > 0.01;

    // 2. Parpadeo periódico natural cada 3 a 5 segundos
    const prevBlink = this.currentBlinkProgress;
    const blinkResult = updateBlinkState(this.blinkState, deltaSeconds);
    this.blinkState = blinkResult.state;
    this.currentBlinkProgress = blinkResult.blinkProgress;

    const blinkChanged = Math.abs(this.currentBlinkProgress - prevBlink) > 0.01;

    // Redibujar ojos únicamente cuando hay cambio visual
    if (gazeMoved || blinkChanged || this.currentBlinkProgress > 0) {
      const palette = getPetColorPalette(this.currentAppearance.color);
      drawEyes(this.eyesLayer, this.currentAppearance.eyes, palette, {
        pupilOffset: this.currentPupilOffset,
        blinkProgress: this.currentBlinkProgress,
      });
    }
  }

  /**
   * Aplica el volteo horizontal (flip) en función de la dirección en la que mira la mascota.
   */
  private applyFacingTransform(): void {
    this.scale.x = this.facingDirection;
  }

  /**
   * Restablece las transformaciones y rotaciones a cero/neutro.
   */
  private resetTransforms(): void {
    this.bodyLayer.scale.set(1, 1);
    this.bodyLayer.rotation = 0;
    this.bodyLayer.y = 0;

    this.headLayer.scale.set(1, 1);
    this.headLayer.rotation = 0;
    this.headLayer.y = 0;

    this.frontEarsLayer.scale.set(1, 1);
    this.frontEarsLayer.rotation = 0;
    this.frontEarsLayer.y = 0;

    this.backEarsLayer.scale.set(1, 1);
    this.backEarsLayer.rotation = 0;
    this.backEarsLayer.y = 0;

    this.eyesLayer.rotation = 0;
    this.eyesLayer.y = 0;

    this.mouthCheeksLayer.rotation = 0;
    this.mouthCheeksLayer.y = 0;

    this.clothesLayer.rotation = 0;
    this.clothesLayer.y = 0;

    this.shadowLayer.scale.set(1, 1);
    this.shadowLayer.rotation = 0;
    this.shadowLayer.y = 0;

    // Redibujar el cuerpo en reposo (patitas alineadas)
    const palette = getPetColorPalette(this.currentAppearance.color);
    drawBody(this.bodyLayer, palette);
  }
}
