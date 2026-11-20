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
});
