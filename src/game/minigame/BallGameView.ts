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
  rotationSpeed: number;
  life: number;
  maxLife: number;
}

/**
 * Escenario temático exterior y renderizador 2D del minijuego de pelota en resolución fija 800x600.
 *
 * Mejoras de T-ART-03 (Rediseño Jugoso del Minijuego de Pelota):
 * - Pelota grande (~100px diámetro) con textura vectorial clásica de balón de fútbol retro Playfish.
 * - Sombra reactiva en el césped que escala y atenúa orgánicamente con la altitud del balón.
 * - Mascota activa en el jardín que sigue la pelota en tiempo real con su mirada (pupil tracking)
 *   y celebra con un saltito de júbilo en cada golpe exitoso.
 * - Efecto de deformación elástica ("squash & stretch") acentuado y jugoso en cada impacto.
 * - Destellos y chispas estelares vectoriales multicolores al golpear la pelota.
 */
export class BallGameView extends Container {
  // Capas del escenario exterior
  private readonly gardenBackground = new Container();
  private readonly skyGraphics = new Graphics();
  private readonly hillsGraphics = new Graphics();
  private readonly fenceGraphics = new Graphics();
  private readonly lawnGraphics = new Graphics();

  // Elementos interactivos
  private readonly shadowGraphics = new Graphics();
  private readonly ballContainer = new Container();
  private readonly ballPatternGraphics = new Graphics();
  private readonly ballLightingGraphics = new Graphics();
  private readonly particleContainer = new Container();

  // Mascota en el jardín
  private petView: PetView;
  private readonly basePetX = 180;
  private readonly basePetY = 430;

  // Estado del juego y simulación física
  private gameState: BallGameState;
  private isRunning = false;
  private activeTicker: Ticker | null = null;
  private readonly onTick = (ticker: Ticker) => this.handleUpdate(ticker);

  // Efectos visuales de impacto y elasticidad
  private ballScaleX = 1;
  private ballScaleY = 1;
  private squashTimer = 0;
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
    this.petView.setPosition(this.basePetX, this.basePetY);
    this.addChild(this.petView);

    // 3. Sombra de la pelota sobre el césped
    this.shadowGraphics.label = 'ball-shadow';
    this.addChild(this.shadowGraphics);

    // 4. Pelota deportiva interactiva
    this.ballContainer.label = 'ball-container';
    this.ballPatternGraphics.label = 'ball-pattern';
    this.ballLightingGraphics.label = 'ball-lighting';
    this.ballContainer.addChild(this.ballPatternGraphics);
    this.ballContainer.addChild(this.ballLightingGraphics);
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
      if (isPointInsideBall(this.gameState.ball, localPos, 24)) {
        this.strikeBall(localPos);
      }
    });
  }

  /** Retorna el estado actual inmutable de la partida. */
  get state(): BallGameState {
    return this.gameState;
  }

  /** Indica si el bucle de actualización está activo. */
  get active(): boolean {
    return this.isRunning;
  }

  /** Acceso a la vista de la mascota en el jardín para pruebas e inspección. */
  get pet(): PetView {
    return this.petView;
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
    this.petView.startIdleAnimation(ticker);
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
    this.squashTimer = 0;
    this.ballPatternGraphics.rotation = 0;
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

    // 1. Efecto visual squash & stretch elástico jugoso
    this.squashTimer = 0.36;

    // 2. Chispas y estrellas de impacto vectoriales
    this.spawnHitSparks(this.gameState.ball.x, this.gameState.ball.y);

    // 3. Salto de celebración de la mascota en el césped (T-ART-03)
    this.petView.cheer(0.35, 32);

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

    // 2. Orientación horizontal y seguimiento ocular de la pelota por la mascota (T-ART-03)
    const ball = this.gameState.ball;
    if (ball.x > this.basePetX + 25) {
      this.petView.setFacing(1);
    } else if (ball.x < this.basePetX - 25) {
      this.petView.setFacing(-1);
    }
    this.petView.setCursorPosition({ x: ball.x, y: ball.y });

    // 3. Deformación elástica de impacto (squash & stretch jugoso de volumen constante)
    if (this.squashTimer > 0) {
      this.squashTimer -= deltaSeconds;
      const progress = Math.max(0, 1 - (this.squashTimer / 0.36));
      const decay = Math.exp(-progress * 5.2);
      const oscillation = Math.cos(progress * Math.PI * 4.2) * decay;
      const squashAmount = oscillation * 0.42;
      this.ballScaleY = Math.max(0.45, 1 - squashAmount);
      this.ballScaleX = Math.max(0.45, 1 + squashAmount * 0.85);
    } else {
      this.ballScaleX = 1;
      this.ballScaleY = 1;
    }

    // 4. Actualización de partículas y estrellas activas
    this.updateParticles(deltaSeconds);

    // 5. Sincronización visual de pelota y sombra reactiva
    this.syncVisuals();
  }

  /**
   * Sincroniza la posición, escala y rotación de la pelota y su sombra en el césped.
   */
  private syncVisuals(): void {
    const { ball, bounds } = this.gameState;

    // Posición y escala con deformación squash & stretch de la pelota
    this.ballContainer.position.set(ball.x, ball.y);
    this.ballContainer.scale.set(this.ballScaleX, this.ballScaleY);

    // Rotación del patrón de costuras según la velocidad horizontal
    this.ballPatternGraphics.rotation += ball.vx * 0.0028;

    // Sombra reactiva en el césped: tamaño y opacidad proporcionales a la proximidad al suelo
    const groundY = bounds.maxY;
    const altitude = Math.max(0, (groundY - ball.radius) - ball.y);
    const maxAltitudeRange = 440;
    const heightFactor = Math.max(0.18, Math.min(1, 1 - (altitude / maxAltitudeRange)));

    this.shadowGraphics.clear();
    this.shadowGraphics.position.set(ball.x, groundY);

    // Dimensiones dinámicas de la sombra elíptica
    const shadowRadiusX = ball.radius * (0.5 + heightFactor * 0.6);
    const shadowRadiusY = 6 + heightFactor * 8;

    // Penumbra difusa exterior (verde bosque oscuro para fundirse armónicamente en el césped)
    this.shadowGraphics
      .ellipse(0, 0, shadowRadiusX, shadowRadiusY)
      .fill({ color: 0x064e3b, alpha: 0.25 * heightFactor });

    // Umbra interior más concentrada y nítida
    this.shadowGraphics
      .ellipse(0, 0, shadowRadiusX * 0.65, shadowRadiusY * 0.65)
      .fill({ color: 0x022c22, alpha: 0.38 * heightFactor });
  }

  /**
   * Dibuja de forma procedimental el balón deportivo clásico retro y sus capas de iluminación 3D.
   */
  private drawBall(): void {
    const r = this.gameState.ball.radius;
    this.drawBallPattern(r);
    this.drawBallLighting(r);
  }

  /**
   * Dibuja los parches deportivos clásicos vectoriales estilo balón de juguete retro (Pet Society).
   * Genera el pentágono central, las costuras radiales y los parches periféricos de contraste.
   */
  private drawBallPattern(r: number): void {
    this.ballPatternGraphics.clear();

    // 1. Esfera base blanca de cuero/plástico
    this.ballPatternGraphics.circle(0, 0, r).fill({ color: 0xffffff });

    // 2. Pentágono central oscuro nítido
    const centerRadius = r * 0.38;
    const centerVertices: { x: number; y: number }[] = [];
    const seamOuterVertices: { x: number; y: number }[] = [];
    const numSides = 5;

    for (let i = 0; i < numSides; i++) {
      const angle = (i * 2 * Math.PI) / numSides - Math.PI / 2;
      centerVertices.push({
        x: Math.cos(angle) * centerRadius,
        y: Math.sin(angle) * centerRadius,
      });
      seamOuterVertices.push({
        x: Math.cos(angle) * (r * 0.72),
        y: Math.sin(angle) * (r * 0.72),
      });
    }

    // Dibujar pentágono central
    this.ballPatternGraphics
      .poly(centerVertices)
      .fill({ color: 0x1e293b })
      .stroke({ color: 0x0f172a, width: 2 });

    // 3. Parches periféricos pentagonales en los bordes
    for (let i = 0; i < numSides; i++) {
      const nextIdx = (i + 1) % numSides;
      const angleMid = (i * 2 * Math.PI) / numSides - Math.PI / 2 + Math.PI / numSides;

      const p1 = seamOuterVertices[i];
      const p2 = seamOuterVertices[nextIdx];

      // Vértices exteriores en el borde esférico
      const edgeAngle1 = angleMid - 0.38;
      const edgeAngle2 = angleMid + 0.38;
      const pEdge1 = { x: Math.cos(edgeAngle1) * r, y: Math.sin(edgeAngle1) * r };
      const pEdgeMid = { x: Math.cos(angleMid) * r, y: Math.sin(angleMid) * r };
      const pEdge2 = { x: Math.cos(edgeAngle2) * r, y: Math.sin(edgeAngle2) * r };

      // Parche exterior oscuro
      this.ballPatternGraphics
        .poly([p1, pEdge1, pEdgeMid, pEdge2, p2])
        .fill({ color: 0x1e293b })
        .stroke({ color: 0x0f172a, width: 1.5 });

      // Costuras de unión desde el pentágono central a los vértices periféricos
      this.ballPatternGraphics
        .poly([centerVertices[i], p1])
        .stroke({ color: 0x334155, width: 2 });
    }
  }

  /**
   * Dibuja los gradientes de luz superior, brillo especular 3D de plástico brillante,
   * luz de rebote del césped y contorno exterior.
   * Se mantiene en ángulo fijo (sin rotación) respecto a la luz del cielo.
   */
  private drawBallLighting(r: number): void {
    this.ballLightingGraphics.clear();

    // 1. Degradado de luz superior (luz solar suave en el hemisferio superior)
    this.ballLightingGraphics
      .ellipse(-r * 0.15, -r * 0.25, r * 0.72, r * 0.5)
      .fill({ color: 0xffffff, alpha: 0.22 });

    // 2. Sombra de oclusión ambiental 3D en el hemisferio inferior derecho
    this.ballLightingGraphics
      .ellipse(r * 0.25, r * 0.28, r * 0.65, r * 0.42)
      .fill({ color: 0x0f172a, alpha: 0.14 });

    // 3. Luz reflejada del césped (ambient bounce light verde sutil en la base)
    this.ballLightingGraphics
      .ellipse(0, r * 0.75, r * 0.48, r * 0.14)
      .fill({ color: 0x86efac, alpha: 0.25 });

    // 4. Brillo especular primario 3D elíptico (plástico brillante clásico Playfish)
    this.ballLightingGraphics
      .ellipse(-r * 0.35, -r * 0.35, r * 0.28, r * 0.16)
      .fill({ color: 0xffffff, alpha: 0.75 });

    // 5. Destello o glint puntual superbrillante (hotspot)
    this.ballLightingGraphics
      .circle(-r * 0.42, -r * 0.42, r * 0.09)
      .fill({ color: 0xffffff, alpha: 0.95 });

    // 6. Contorno exterior nítido (borde de silueta)
    this.ballLightingGraphics
      .circle(0, 0, r)
      .stroke({ color: 0x0f172a, width: 3.2 });
  }

  /**
   * Genera una explosión de chispas y estrellas vectoriales al golpear la pelota.
   */
  private spawnHitSparks(x: number, y: number): void {
    const sparkCount = 12;
    const starColors = [0xfde047, 0xffffff, 0xf472b6, 0x38bdf8, 0xfb923c, 0xa78bfa];

    for (let i = 0; i < sparkCount; i++) {
      const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.5;
      const speed = 140 + Math.random() * 180;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 60; // Leve sesgo inicial hacia arriba
      const color = starColors[i % starColors.length];
      const starSize = 5 + Math.random() * 5;

      const starGraphics = new Graphics();
      this.drawStarShape(starGraphics, starSize, color);
      starGraphics.position.set(x, y);

      this.particleContainer.addChild(starGraphics);
      this.particles.push({
        graphics: starGraphics,
        vx,
        vy,
        rotationSpeed: (Math.random() - 0.5) * 12,
        life: 0.42,
        maxLife: 0.42,
      });
    }
  }

  /**
   * Dibuja una estrella o destello de 4 puntas estilo anime / chibi Playfish.
   */
  private drawStarShape(g: Graphics, outerRadius: number, color: number): void {
    const innerRadius = outerRadius * 0.32;
    const points: { x: number; y: number }[] = [];
    const spikes = 4;
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes - Math.PI / 2;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    g.poly(points).fill({ color });
  }

  /**
   * Actualiza la posición, opacidad, escala y rotación de las partículas activas.
   */
  private updateParticles(dt: number): void {
    const remaining: Particle[] = [];

    for (const p of this.particles) {
      p.life -= dt;
      if (p.life > 0) {
        p.graphics.x += p.vx * dt;
        p.graphics.y += p.vy * dt;
        p.vy += 320 * dt; // Gravedad suave para parábola de chispas
        p.graphics.rotation += p.rotationSpeed * dt;
        const progress = p.life / p.maxLife;
        p.graphics.alpha = progress;
        p.graphics.scale.set(progress * 1.1);
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
