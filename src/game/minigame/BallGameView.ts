import { Container, Graphics, Ticker, type DestroyOptions } from 'pixi.js';
import type { BallGameState, PetAppearance, PetClothes } from '../../domain';
import {
  createInitialBallGameState,
  hitBall,
  isPointInsideBall,
  updateBallPhysics,
} from '../../domain';
import { PetView } from '../pet';
import type { BallGameViewOptions } from './types';

interface Particle {
  graphics: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * Escenario temático exterior y renderizador 2D del minijuego de pelota en resolución fija 800x600.
 *
 * Responsabilidades:
 * - Renderizar de forma 100% vectorial el exterior (cielo, nubes, colinas, valla, césped y flores).
 * - Dibujar la pelota deportiva procedural con sombra reactiva en el suelo.
 * - Mostrar la mascota animada cheering en el césped que reacciona a los toques.
 * - Integrar el bucle de actualización (Ticker de PixiJS) con la física de dominio puro.
 * - Gestionar eventos de puntero (clic y toque táctil) y efectos visuales de impacto (squash y chispas).
 */
export class BallGameView extends Container {
  // Capas del escenario
  private readonly gardenBackground = new Container();
  private readonly skyGraphics = new Graphics();
  private readonly hillsGraphics = new Graphics();
  private readonly fenceGraphics = new Graphics();
  private readonly lawnGraphics = new Graphics();

  // Elementos interactivos
  private readonly shadowGraphics = new Graphics();
  private readonly ballContainer = new Container();
  private readonly ballGraphics = new Graphics();
  private readonly particleContainer = new Container();

  // Mascota en el jardín
  private petView: PetView;
  private petHopTimer = 0;
  private readonly basePetY = 430;

  // Estado del juego y simulación física
  private gameState: BallGameState;
  private isRunning = false;
  private activeTicker: Ticker | null = null;
  private readonly onTick = (ticker: Ticker) => this.handleUpdate(ticker);

  // Efectos visuales de impacto
  private ballScaleX = 1;
  private ballScaleY = 1;
  private particles: Particle[] = [];

  // Callbacks
  private readonly callbacks: BallGameViewOptions;

  constructor(options: BallGameViewOptions = {}) {
    super();

    this.label = 'ball-game-view';
    this.callbacks = options;

    this.gameState = createInitialBallGameState(
      undefined,
      options.highScore ?? 0
    );

    // 1. Montaje del escenario exterior
    this.gardenBackground.label = 'garden-background';
    this.gardenBackground.addChild(this.skyGraphics);
    this.gardenBackground.addChild(this.hillsGraphics);
    this.gardenBackground.addChild(this.fenceGraphics);
    this.gardenBackground.addChild(this.lawnGraphics);
    this.addChild(this.gardenBackground);

    // 2. Mascota cheering en el jardín
    this.petView = new PetView(options.appearance, options.clothes);
    this.petView.setPosition(180, this.basePetY);
    this.addChild(this.petView);

    // 3. Sombra de la pelota sobre el césped
    this.shadowGraphics.label = 'ball-shadow';
    this.addChild(this.shadowGraphics);

    // 4. Pelota deportiva interactiva
    this.ballContainer.label = 'ball-container';
    this.ballContainer.addChild(this.ballGraphics);
    this.ballContainer.eventMode = 'static';
    this.ballContainer.cursor = 'pointer';
    this.addChild(this.ballContainer);

    // 5. Contenedor de partículas y chispas de golpe
    this.particleContainer.label = 'particle-container';
    this.addChild(this.particleContainer);

    // Renderizado procedural inicial
    this.renderGarden();
    this.drawBall();
    this.syncVisuals();

    // Eventos de interacción directa sobre la pelota
    this.ballContainer.on('pointerdown', (event) => {
      event.stopPropagation();
      const localPos = event.getLocalPosition(this);
      this.strikeBall(localPos);
    });

    // Evento sobre el escenario completo con tolerancia para móviles
    this.eventMode = 'static';
    this.on('pointerdown', (event) => {
      const localPos = event.getLocalPosition(this);
      if (isPointInsideBall(this.gameState.ball, localPos, 22)) {
        this.strikeBall(localPos);
      }
    });
  }

  /** Retorna el estado actual de la partida. */
  get state(): BallGameState {
    return this.gameState;
  }

  /** Indica si el bucle de actualización está activo. */
  get active(): boolean {
    return this.isRunning;
  }

  /**
   * Inicia o reanuda la simulación física del minijuego con el Ticker provisto.
   */
  start(ticker: Ticker = Ticker.shared): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.activeTicker = ticker;
    this.activeTicker.add(this.onTick);
    if (typeof requestAnimationFrame !== 'undefined') {
      this.petView.startIdleAnimation(ticker);
    }
  }

  /**
   * Pausa temporalmente la simulación física (p. ej. al cambiar de vista).
   */
  pause(): void {
    if (!this.isRunning) {
      return;
    }
    this.isRunning = false;
    if (this.activeTicker) {
      try {
        this.activeTicker.remove(this.onTick);
      } catch {
        // Ignora si el ticker ya fue destruido externamente
      }
      this.activeTicker = null;
    }
    this.petView.stopIdleAnimation();
  }

  /**
   * Reanuda la simulación física.
   */
  resume(): void {
    this.start(Ticker.shared);
  }

  /**
   * Reinicia la partida restableciendo la pelota a la posición de saque inicial.
   */
  resetGame(highScore?: number): void {
    const currentHigh = highScore ?? this.gameState.highScore;
    this.gameState = createInitialBallGameState(undefined, currentHigh);
    this.ballScaleX = 1;
    this.ballScaleY = 1;
    this.clearParticles();
    this.syncVisuals();
    this.callbacks.onStateChange?.(this.gameState);
    this.callbacks.onScoreChange?.(0, 0);
  }

  /**
   * Actualiza la apariencia y ropa de la mascota en el jardín.
   */
  updatePetAppearance(
    appearance: PetAppearance,
    clothes?: PetClothes | readonly string[]
  ): void {
    this.petView.updateAppearance(appearance, clothes);
  }

  /**
   * Ejecuta el golpe sobre la pelota, desencadenando la física pura y los efectos visuales.
   */
  strikeBall(hitPoint?: { x: number; y: number }): void {
    // Si la partida ya terminó, ignorar toques hasta que el usuario reinicie
    if (this.gameState.status === 'game_over') {
      return;
    }

    const previousScore = this.gameState.score;
    const nextState = hitBall(this.gameState, hitPoint);

    // Si no hubo cambio (falló el golpe)
    if (nextState === this.gameState) {
      return;
    }

    this.gameState = nextState;

    // 1. Efecto visual squash & stretch en la pelota
    this.ballScaleX = 1.35;
    this.ballScaleY = 0.65;

    // 2. Chispas y estrellas de impacto
    this.spawnHitSparks(this.gameState.ball.x, this.gameState.ball.y);

    // 3. Salto de celebración de la mascota en el césped
    this.petHopTimer = 0.28;

    // 4. Notificación reactiva
    if (this.gameState.score > previousScore) {
      this.callbacks.onHitSuccess?.(this.gameState.combo);
      this.callbacks.onScoreChange?.(this.gameState.score, this.gameState.combo);
    }
    this.callbacks.onStateChange?.(this.gameState);
  }

  /**
   * Limpia recursos y detiene el Ticker al destruir la vista.
   */
  override destroy(options?: DestroyOptions): void {
    this.pause();
    this.clearParticles();
    this.petView.destroy();
    super.destroy(options ?? { children: true });
  }

  /**
   * Bucle de actualización por frame.
   */
  private handleUpdate(ticker: Ticker): void {
    const deltaSeconds = (ticker.deltaMS || 16.6) / 1000;
    const previousStatus = this.gameState.status;

    // 1. Paso temporal de física pura
    if (this.gameState.status === 'playing') {
      this.gameState = updateBallPhysics(this.gameState, deltaSeconds);

      // Si acaba de tocar el suelo y pasar a game_over
      if (this.gameState.status === 'game_over' && previousStatus === 'playing') {
        this.callbacks.onGameOver?.(
          this.gameState.score,
          this.gameState.coinsEarned
        );
        this.callbacks.onStateChange?.(this.gameState);
      }
    }

    // 2. Animación de salto de la mascota al golpear
    if (this.petHopTimer > 0) {
      this.petHopTimer -= deltaSeconds;
      const progress = Math.max(0, this.petHopTimer / 0.28);
      const hopOffset = Math.sin((1 - progress) * Math.PI) * 24;
      this.petView.setPosition(180, this.basePetY - hopOffset);
    } else {
      this.petView.setPosition(180, this.basePetY);
    }

    // 3. Recuperación del efecto squash & stretch de la pelota
    const recoveryRate = Math.min(1, deltaSeconds * 14);
    this.ballScaleX += (1 - this.ballScaleX) * recoveryRate;
    this.ballScaleY += (1 - this.ballScaleY) * recoveryRate;

    // 4. Actualización de partículas de impacto
    this.updateParticles(deltaSeconds);

    // 5. Sincronización visual de pelota y sombra
    this.syncVisuals();
  }

  /**
   * Sincroniza la posición, escala y rotación de la pelota y su sombra.
   */
  private syncVisuals(): void {
    const { ball, bounds } = this.gameState;

    // Posición y escala de la pelota
    this.ballContainer.position.set(ball.x, ball.y);
    this.ballContainer.scale.set(this.ballScaleX, this.ballScaleY);

    // Rotación dinámica al desplazarse horizontalmente
    this.ballGraphics.rotation += (ball.vx * 0.003);

    // Sombra en el suelo: el tamaño y opacidad dependen de la altura
    const groundY = bounds.maxY;
    const heightAboveGround = Math.max(0, groundY - ball.y);
    const heightFactor = Math.max(0.2, 1 - heightAboveGround / 500);

    this.shadowGraphics.clear();
    this.shadowGraphics.position.set(ball.x, groundY);
    this.shadowGraphics
      .ellipse(0, 0, ball.radius * (0.8 + heightFactor * 0.4), 8 * heightFactor)
      .fill({ color: 0x0f172a, alpha: 0.35 * heightFactor });
  }

  /**
   * Dibuja la pelota deportiva con textura procedimental y brillo especular.
   */
  private drawBall(): void {
    const r = this.gameState.ball.radius;
    this.ballGraphics.clear();

    // 1. Círculo base blanco
    this.ballGraphics.circle(0, 0, r).fill({ color: 0xffffff });

    // 2. Franjas deportivas de colores cálidos
    // Franja roja central curvada
    this.ballGraphics
      .ellipse(0, 0, r * 0.55, r)
      .fill({ color: 0xef4444 });

    // Franja dorada interior
    this.ballGraphics
      .ellipse(0, 0, r * 0.28, r)
      .fill({ color: 0xf59e0b });

    // Franjas laterales azuladas
    this.ballGraphics
      .circle(-r * 0.65, 0, r * 0.45)
      .fill({ color: 0x3b82f6 });
    this.ballGraphics
      .circle(r * 0.65, 0, r * 0.45)
      .fill({ color: 0x3b82f6 });

    // 3. Contorno exterior nítido
    this.ballGraphics
      .circle(0, 0, r)
      .stroke({ color: 0x1e293b, width: 2.5 });

    // 4. Brillo especular esférico (reflejo de luz 3D)
    this.ballGraphics
      .ellipse(-r * 0.35, -r * 0.35, r * 0.3, r * 0.18)
      .fill({ color: 0xffffff, alpha: 0.7 });
  }

  /**
   * Genera chispas y estrellas al golpear la pelota.
   */
  private spawnHitSparks(x: number, y: number): void {
    const sparkCount = 8;
    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.4;
      const speed = 120 + Math.random() * 160;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const spark = new Graphics();
      spark.circle(0, 0, 3 + Math.random() * 3).fill({
        color: i % 2 === 0 ? 0xffeb3b : 0xffffff,
      });
      spark.position.set(x, y);

      this.particleContainer.addChild(spark);
      this.particles.push({
        graphics: spark,
        vx,
        vy,
        life: 0.32,
        maxLife: 0.32,
      });
    }
  }

  /**
   * Actualiza la posición y opacidad de las partículas activas.
   */
  private updateParticles(dt: number): void {
    const remaining: Particle[] = [];

    for (const p of this.particles) {
      p.life -= dt;
      if (p.life > 0) {
        p.graphics.x += p.vx * dt;
        p.graphics.y += p.vy * dt;
        p.graphics.alpha = p.life / p.maxLife;
        remaining.push(p);
      } else {
        this.particleContainer.removeChild(p.graphics);
        p.graphics.destroy();
      }
    }

    this.particles = remaining;
  }

  /**
   * Limpia todas las partículas activas del escenario.
   */
  private clearParticles(): void {
    for (const p of this.particles) {
      this.particleContainer.removeChild(p.graphics);
      p.graphics.destroy();
    }
    this.particles = [];
  }

  /**
   * Dibuja de forma 100% vectorial el jardín exterior (800x600).
   */
  private renderGarden(): void {
    // 1. Cielo azul luminoso
    this.skyGraphics.clear();
    this.skyGraphics.rect(0, 0, 800, 390).fill({ color: 0x87ceeb });

    // Nubes suaves procedimentales
    this.drawCloud(this.skyGraphics, 160, 90, 50);
    this.drawCloud(this.skyGraphics, 460, 70, 65);
    this.drawCloud(this.skyGraphics, 680, 110, 45);

    // 2. Colinas de fondo
    this.hillsGraphics.clear();
    // Colinas distantes más claras
    this.hillsGraphics
      .ellipse(200, 390, 280, 110)
      .fill({ color: 0x86efac });
    this.hillsGraphics
      .ellipse(620, 390, 320, 130)
      .fill({ color: 0x86efac });

    // Colinas intermedias
    this.hillsGraphics
      .ellipse(400, 400, 260, 90)
      .fill({ color: 0x4ade80 });

    // 3. Valla de madera clásica
    this.fenceGraphics.clear();
    // Travesaños horizontales
    this.fenceGraphics
      .rect(0, 360, 800, 8)
      .fill({ color: 0xd4a373 });
    this.fenceGraphics
      .rect(0, 380, 800, 8)
      .fill({ color: 0xd4a373 });

    // Postes verticales
    for (let x = 20; x < 800; x += 45) {
      this.fenceGraphics
        .roundRect(x, 345, 12, 45, 4)
        .fill({ color: 0xfef3c7 })
        .stroke({ color: 0xc2884e, width: 1.5 });
    }

    // 4. Césped en primer plano y flores
    this.lawnGraphics.clear();
    this.lawnGraphics.rect(0, 390, 800, 210).fill({ color: 0x22c55e });

    // Hilera superior de briznas de hierba
    for (let x = 10; x < 800; x += 15) {
      this.lawnGraphics
        .poly([
          { x, y: 390 },
          { x: x + 5, y: 382 },
          { x: x + 10, y: 390 },
        ])
        .fill({ color: 0x16a34a });
    }

    // Flores de colores salpicadas por el jardín
    const flowerPositions = [
      { x: 80, y: 440, color: 0xf472b6 },
      { x: 120, y: 470, color: 0xfbbf24 },
      { x: 300, y: 460, color: 0x60a5fa },
      { x: 360, y: 490, color: 0xf472b6 },
      { x: 500, y: 450, color: 0xfbbf24 },
      { x: 560, y: 480, color: 0xffffff },
      { x: 680, y: 460, color: 0xf472b6 },
      { x: 740, y: 495, color: 0x60a5fa },
    ];

    for (const f of flowerPositions) {
      // Tallo
      this.lawnGraphics.rect(f.x, f.y, 2, 10).fill({ color: 0x15803d });
      // Pétalos
      this.lawnGraphics.circle(f.x - 3, f.y, 4).fill({ color: f.color });
      this.lawnGraphics.circle(f.x + 3, f.y, 4).fill({ color: f.color });
      this.lawnGraphics.circle(f.x, f.y - 3, 4).fill({ color: f.color });
      this.lawnGraphics.circle(f.x, f.y + 3, 4).fill({ color: f.color });
      // Centro dorado
      this.lawnGraphics.circle(f.x, f.y, 2.5).fill({ color: 0xf59e0b });
    }
  }

  /**
   * Dibuja una nube procedimental combinando círculos suaves.
   */
  private drawCloud(g: Graphics, x: number, y: number, size: number): void {
    const alpha = 0.88;
    g.circle(x, y, size * 0.45).fill({ color: 0xffffff, alpha });
    g.circle(x - size * 0.35, y + size * 0.1, size * 0.35).fill({ color: 0xffffff, alpha });
    g.circle(x + size * 0.35, y + size * 0.1, size * 0.35).fill({ color: 0xffffff, alpha });
    g.ellipse(x, y + size * 0.18, size * 0.65, size * 0.25).fill({ color: 0xffffff, alpha });
  }
}
