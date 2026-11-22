import { describe, expect, it, vi } from 'vitest';
import { Ticker } from 'pixi.js';
import { BallGameView } from '../BallGameView';

describe('BallGameView (Escenario y Render 2D del Minijuego de Pelota)', () => {
  const createMockTicker = (): Ticker => {
    const ticker = new Ticker();
    ticker.autoStart = false;
    ticker.stop();
    return ticker;
  };

  it('inicializa con la estructura modular completa del escenario exterior', () => {
    const view = new BallGameView();

    expect(view.label).toBe('ball-game-view');
    expect(view.children.length).toBe(5);
    expect(view.state.status).toBe('idle');
    expect(view.state.score).toBe(0);
    expect(view.active).toBe(false);

    view.destroy();
  });

  it('permite iniciar, pausar y reanudar la simulación', () => {
    const view = new BallGameView();
    const ticker = createMockTicker();

    view.start(ticker);
    expect(view.active).toBe(true);

    view.pause();
    expect(view.active).toBe(false);

    view.start(ticker);
    expect(view.active).toBe(true);

    view.destroy();
    ticker.destroy();
  });

  it('strikeBall aplica el golpe, incrementa el score y dispara los callbacks', () => {
    const onScoreChange = vi.fn();
    const onHitSuccess = vi.fn();
    const onStateChange = vi.fn();

    const view = new BallGameView({
      onScoreChange,
      onHitSuccess,
      onStateChange,
    });

    view.strikeBall();

    expect(view.state.status).toBe('playing');
    expect(view.state.score).toBe(1);
    expect(view.state.combo).toBe(1);
    expect(onScoreChange).toHaveBeenCalledWith(1, 1);
    expect(onHitSuccess).toHaveBeenCalledWith(1);
    expect(onStateChange).toHaveBeenCalled();

    view.destroy();
  });

  it('strikeBall con coordenadas fuera de la pelota es un fallo y no altera la puntuación', () => {
    const onScoreChange = vi.fn();
    const view = new BallGameView({ onScoreChange });

    // Coordenadas muy lejanas de la pelota
    view.strikeBall({ x: 20, y: 20 });

    expect(view.state.status).toBe('idle');
    expect(view.state.score).toBe(0);
    expect(onScoreChange).not.toHaveBeenCalled();

    view.destroy();
  });

  it('resetGame restablece la partida a idle conservando el highScore', () => {
    const view = new BallGameView({ highScore: 15 });

    view.strikeBall();
    expect(view.state.status).toBe('playing');
    expect(view.state.score).toBe(1);

    view.resetGame();

    expect(view.state.status).toBe('idle');
    expect(view.state.score).toBe(0);
    expect(view.state.combo).toBe(0);
    expect(view.state.highScore).toBe(15);

    view.destroy();
  });

  it('updatePetAppearance actualiza la apariencia sin errores', () => {
    const view = new BallGameView();

    expect(() =>
      view.updatePetAppearance(
        { color: 'orange', eyes: 'happy', mouth: 'open', ears: 'pointy' },
        { hat: 'hat-party' }
      )
    ).not.toThrow();

    view.destroy();
  });

  it('destruye la vista limpiamente deteniendo el bucle', () => {
    const view = new BallGameView();
    const ticker = createMockTicker();
    view.start(ticker);

    expect(() => view.destroy()).not.toThrow();
    expect(view.destroyed).toBe(true);
    expect(view.active).toBe(false);

    ticker.destroy();
  });

  it('renderiza la pelota grande con subcapas modulares de patrón e iluminación 3D', () => {
    const view = new BallGameView();

    // Radio físico duplicado a 48px (~96-100px de diámetro)
    expect(view.state.ball.radius).toBe(48);

    // Contenedor de la pelota interactiva (hijo índice 3)
    const ballContainer = view.children[3];
    expect(ballContainer.label).toBe('ball-container');
    expect(ballContainer.children.length).toBe(2);

    const patternGraphics = ballContainer.children[0];
    const lightingGraphics = ballContainer.children[1];
    expect(patternGraphics.label).toBe('ball-pattern');
    expect(lightingGraphics.label).toBe('ball-lighting');

    view.destroy();
  });

  it('la mascota sigue la trayectoria de la pelota con orientación y mirada', () => {
    const view = new BallGameView();
    const ticker = createMockTicker();
    view.start(ticker);

    // Inicialmente la pelota está en x=400 (a la derecha de la mascota en x=180)
    ticker.update(16);
    expect(view.pet.facing).toBe(1);

    // Simular que la pelota viaja a la izquierda de la mascota (x=100 < 180 - 25)
    // Forzamos temporalmente la posición de la pelota para verificar reactividad de la mascota
    (view.state.ball as { x: number }).x = 100;
    ticker.update(32);
    expect(view.pet.facing).toBe(-1);

    // Regresar a la derecha (x=500 > 180 + 25)
    (view.state.ball as { x: number }).x = 500;
    ticker.update(48);
    expect(view.pet.facing).toBe(1);

    view.destroy();
    ticker.destroy();
  });

  it('strikeBall activa deformación elástica squash & stretch, chispas estelares y festejo de la mascota', () => {
    const view = new BallGameView();
    const cheerSpy = vi.spyOn(view.pet, 'cheer');

    view.strikeBall();

    // 1. Saltito de júbilo en la mascota
    expect(cheerSpy).toHaveBeenCalledWith(0.35, 32);

    // 2. Partículas estelares generadas en el contenedor de partículas (índice 4)
    const particleContainer = view.children[4];
    expect(particleContainer.label).toBe('particle-container');
    expect(particleContainer.children.length).toBe(12);

    // 3. Deformación squash & stretch aplicada en el contenedor de la pelota
    const ballContainer = view.children[3];
    const ticker = createMockTicker();
    view.start(ticker);

    // Al inicio del impacto (primer fotograma), está aplastada en Y y ensanchada en X
    ticker.update(16);
    expect(ballContainer.scale.y).toBeLessThan(1);
    expect(ballContainer.scale.x).toBeGreaterThan(1);

    view.destroy();
    ticker.destroy();
  });

  it('sincroniza la sombra elíptica reactiva en el suelo según la altitud de la pelota', () => {
    const view = new BallGameView();
    const shadowGraphics = view.children[2];
    expect(shadowGraphics.label).toBe('ball-shadow');

    // La posición X de la sombra siempre coincide con la coordenada X de la pelota
    expect(shadowGraphics.position.x).toBe(view.state.ball.x);
    expect(shadowGraphics.position.y).toBe(view.state.bounds.maxY);

    view.destroy();
  });
});
