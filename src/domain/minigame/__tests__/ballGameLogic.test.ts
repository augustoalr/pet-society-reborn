import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BALL_BOUNDS,
  DEFAULT_BALL_CONFIG,
  calculateCoinReward,
  calculateHappinessReward,
  calculateMinigameReward,
  createInitialBallGameState,
  hitBall,
  isPointInsideBall,
  startBallGame,
  updateBallPhysics,
} from '../ballGameLogic';
import type { BallGameState } from '../types';

describe('ballGameLogic (Lógica de Dominio del Minijuego de Pelota)', () => {
  describe('createInitialBallGameState', () => {
    it('crea el estado inicial con valores por defecto e inmutables', () => {
      const state = createInitialBallGameState();

      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.highScore).toBe(0);
      expect(state.coinsEarned).toBe(0);
      expect(state.ball.radius).toBe(DEFAULT_BALL_CONFIG.radius);
      expect(state.ball.vx).toBe(0);
      expect(state.ball.vy).toBe(0);

      const expectedX = Math.round(
        (DEFAULT_BALL_BOUNDS.minX + DEFAULT_BALL_BOUNDS.maxX) / 2
      );
      expect(state.ball.x).toBe(expectedX);
      expect(state.bounds).toEqual(DEFAULT_BALL_BOUNDS);
    });

    it('duplica el radio físico de la pelota a 48px (~100px diámetro) para cumplir con T-ART-03', () => {
      const state = createInitialBallGameState();

      expect(state.ball.radius).toBe(48);
      expect(state.ball.radius * 2).toBe(96);
      expect(DEFAULT_BALL_CONFIG.radius).toBe(48);
      // Físicas flotantes y generosas ("floaty & bouncy")
      expect(DEFAULT_BALL_CONFIG.gravity).toBe(780);
      expect(DEFAULT_BALL_CONFIG.hitImpulseY).toBe(-640);
      expect(DEFAULT_BALL_CONFIG.reboundRestitution).toBe(0.78);
    });

    it('respeta límites y récord máximo proporcionados', () => {
      const customBounds = { minX: 10, maxX: 500, minY: 10, maxY: 400 };
      const state = createInitialBallGameState(customBounds, 42);

      expect(state.bounds.minX).toBe(10);
      expect(state.bounds.maxX).toBe(500);
      expect(state.highScore).toBe(42);
      expect(state.ball.x).toBe(255);
    });
  });

  describe('startBallGame', () => {
    it('transiciona de idle a playing con un ligero impulso hacia arriba', () => {
      const idleState = createInitialBallGameState();
      const playingState = startBallGame(idleState);

      expect(playingState.status).toBe('playing');
      expect(playingState.ball.vy).toBeLessThan(0);
      expect(playingState.score).toBe(0);
      expect(playingState.combo).toBe(0);
      expect(idleState.status).toBe('idle'); // Inmutabilidad
    });

    it('si ya está en playing retorna el mismo estado sin alterarlo', () => {
      const idleState = createInitialBallGameState();
      const playingState = startBallGame(idleState);
      const sameState = startBallGame(playingState);

      expect(sameState).toBe(playingState);
    });
  });

  describe('updateBallPhysics', () => {
    it('no actualiza la física si el estado no es playing', () => {
      const idleState = createInitialBallGameState();
      const nextState = updateBallPhysics(idleState, 0.016);

      expect(nextState).toBe(idleState);
    });

    it('ignora deltas de tiempo menores o iguales a cero o no finitos', () => {
      const playingState = startBallGame(createInitialBallGameState());
      expect(updateBallPhysics(playingState, 0)).toBe(playingState);
      expect(updateBallPhysics(playingState, -0.05)).toBe(playingState);
      expect(updateBallPhysics(playingState, Number.NaN)).toBe(playingState);
      expect(updateBallPhysics(playingState, Number.POSITIVE_INFINITY)).toBe(playingState);
    });

    it('aplica gravedad e incrementa la velocidad vertical hacia abajo', () => {
      const initial = startBallGame(createInitialBallGameState());
      const state1 = updateBallPhysics(initial, 0.05);

      expect(state1.ball.vy).toBeGreaterThan(initial.ball.vy);
      expect(state1.ball.y).not.toBe(initial.ball.y);
    });

    it('rebota elásticamente en la pared lateral izquierda', () => {
      const base = startBallGame(createInitialBallGameState());
      // Forzar posición pegada a la pared izquierda con velocidad hacia la izquierda
      const headingLeft: BallGameState = {
        ...base,
        ball: {
          ...base.ball,
          x: base.bounds.minX + base.ball.radius + 5,
          vx: -200,
        },
      };

      const rebounded = updateBallPhysics(headingLeft, 0.1);
      // Debe haber rebotado hacia la derecha (vx > 0)
      expect(rebounded.ball.vx).toBeGreaterThan(0);
      expect(rebounded.ball.x).toBeGreaterThanOrEqual(base.bounds.minX + base.ball.radius);
    });

    it('rebota elásticamente en la pared lateral derecha', () => {
      const base = startBallGame(createInitialBallGameState());
      // Forzar posición pegada a la pared derecha con velocidad hacia la derecha
      const headingRight: BallGameState = {
        ...base,
        ball: {
          ...base.ball,
          x: base.bounds.maxX - base.ball.radius - 5,
          vx: 200,
        },
      };

      const rebounded = updateBallPhysics(headingRight, 0.1);
      // Debe haber rebotado hacia la izquierda (vx < 0)
      expect(rebounded.ball.vx).toBeLessThan(0);
      expect(rebounded.ball.x).toBeLessThanOrEqual(base.bounds.maxX - base.ball.radius);
    });

    it('rebota en el techo (minY) invirtiendo vy hacia abajo', () => {
      const base = startBallGame(createInitialBallGameState());
      const hittingCeiling: BallGameState = {
        ...base,
        ball: {
          ...base.ball,
          y: base.bounds.minY + base.ball.radius + 5,
          vy: -300,
        },
      };

      const rebounded = updateBallPhysics(hittingCeiling, 0.1);
      expect(rebounded.ball.vy).toBeGreaterThan(0);
      expect(rebounded.ball.y).toBeGreaterThanOrEqual(base.bounds.minY + base.ball.radius);
    });

    it('detecta colisión con el suelo (maxY), pasa a game_over y liquida recompensas', () => {
      const base = startBallGame(createInitialBallGameState());
      const nearGroundWithScore: BallGameState = {
        ...base,
        score: 12,
        combo: 12,
        highScore: 10,
        ball: {
          ...base.ball,
          y: base.bounds.maxY - base.ball.radius - 2,
          vy: 500,
        },
      };

      const gameOverState = updateBallPhysics(nearGroundWithScore, 0.05);

      expect(gameOverState.status).toBe('game_over');
      expect(gameOverState.score).toBe(12);
      expect(gameOverState.combo).toBe(0);
      expect(gameOverState.highScore).toBe(12); // Nuevo récord
      expect(gameOverState.coinsEarned).toBe(calculateCoinReward(12));
      expect(gameOverState.ball.vx).toBe(0);
      expect(gameOverState.ball.vy).toBe(0);
      expect(gameOverState.ball.y).toBe(base.bounds.maxY - base.ball.radius);
    });
  });

  describe('hitBall', () => {
    it('inicia el juego inmediatamente si estaba en idle', () => {
      const idleState = createInitialBallGameState();
      const hitState = hitBall(idleState);

      expect(hitState.status).toBe('playing');
      expect(hitState.score).toBe(1);
      expect(hitState.combo).toBe(1);
      expect(hitState.highScore).toBe(1);
      expect(hitState.ball.vy).toBe(DEFAULT_BALL_CONFIG.hitImpulseY);
    });

    it('incrementa el contador de toques y combo en una partida activa', () => {
      const playingState = startBallGame(createInitialBallGameState());
      const hit1 = hitBall(playingState);
      const hit2 = hitBall(hit1);

      expect(hit2.score).toBe(2);
      expect(hit2.combo).toBe(2);
      expect(hit2.highScore).toBe(2);
    });

    it('no aplica golpe si la partida está en game_over', () => {
      const idleState = createInitialBallGameState();
      const gameOverState: BallGameState = {
        ...idleState,
        status: 'game_over',
      };

      const result = hitBall(gameOverState);
      expect(result).toBe(gameOverState);
    });

    it('detecta fallo si las coordenadas de golpe están fuera del radio de la pelota', () => {
      const playingState = startBallGame(createInitialBallGameState());
      // Pelota en x=400, y=250. Golpe en x=50, y=50 (lejos)
      const missResult = hitBall(playingState, { x: 50, y: 50 });

      expect(missResult).toBe(playingState);
      expect(missResult.score).toBe(0);
    });

    it('modula vx hacia la derecha si el golpe fue a la izquierda del centro', () => {
      const playingState = startBallGame(createInitialBallGameState());
      const ballX = playingState.ball.x;
      const ballY = playingState.ball.y;

      // Golpe 15px a la izquierda del centro de la pelota
      const hitLeft = hitBall(playingState, { x: ballX - 15, y: ballY });

      expect(hitLeft.ball.vx).toBeGreaterThan(0);
      expect(hitLeft.ball.vy).toBe(DEFAULT_BALL_CONFIG.hitImpulseY);
    });

    it('modula vx hacia la izquierda si el golpe fue a la derecha del centro', () => {
      const playingState = startBallGame(createInitialBallGameState());
      const ballX = playingState.ball.x;
      const ballY = playingState.ball.y;

      // Golpe 15px a la derecha del centro de la pelota
      const hitRight = hitBall(playingState, { x: ballX + 15, y: ballY });

      expect(hitRight.ball.vx).toBeLessThan(0);
      expect(hitRight.ball.vy).toBe(DEFAULT_BALL_CONFIG.hitImpulseY);
    });

    it('combina inercia previa con nuevo impulso permitiendo contragolpes precisos', () => {
      const base = startBallGame(createInitialBallGameState());
      // Pelota desplazándose velozmente hacia la izquierda
      const movingLeft: BallGameState = {
        ...base,
        ball: {
          ...base.ball,
          vx: -200,
        },
      };

      // Golpe contundente a la izquierda del centro para revertir la dirección hacia la derecha
      const counterHit = hitBall(movingLeft, { x: movingLeft.ball.x - 35, y: movingLeft.ball.y });

      // Debe haber superado la inercia negativa (-200 * 0.35 = -70 + (35/48)*340 = +177.9 > 0)
      expect(counterHit.ball.vx).toBeGreaterThan(0);
    });

    it('admite amplio margen táctil para comodidad en pantallas móviles táctiles', () => {
      const base = startBallGame(createInitialBallGameState());
      const ballX = base.ball.x;
      const ballY = base.ball.y;

      // Radio de la pelota = 48, margen por defecto = 20 => radio efectivo = 68px
      // Toque a 60px del centro (dentro del radio efectivo)
      const touchNear = hitBall(base, { x: ballX + 60, y: ballY });
      expect(touchNear.score).toBe(1);

      // Toque a 80px del centro (fuera del margen)
      const touchFar = hitBall(base, { x: ballX + 80, y: ballY });
      expect(touchFar.score).toBe(0);
    });
  });

  describe('calculateCoinReward & calculateHappinessReward', () => {
    it('retorna 0 monedas si la puntuación es menor o igual a cero', () => {
      expect(calculateCoinReward(0)).toBe(0);
      expect(calculateCoinReward(-10)).toBe(0);
      expect(calculateCoinReward(Number.NaN)).toBe(0);
    });

    it('calcula monedas base y bonificaciones por hitos de combo correctamente', () => {
      expect(calculateCoinReward(1)).toBe(2); // 1*2
      expect(calculateCoinReward(4)).toBe(8); // 4*2
      expect(calculateCoinReward(5)).toBe(15); // 5*2 + 5
      expect(calculateCoinReward(9)).toBe(23); // 9*2 + 5
      expect(calculateCoinReward(10)).toBe(30); // 10*2 + 10
      expect(calculateCoinReward(20)).toBe(60); // 20*2 + 20
    });

    it('calcula la recompensa de felicidad con mínimo de 5 y tope de 50', () => {
      expect(calculateHappinessReward(0)).toBe(0);
      expect(calculateHappinessReward(1)).toBe(5); // mínimo garantizado
      expect(calculateHappinessReward(5)).toBe(10);
      expect(calculateHappinessReward(10)).toBe(20);
      expect(calculateHappinessReward(25)).toBe(50);
      expect(calculateHappinessReward(100)).toBe(50); // cap en 50
    });

    it('calculateMinigameReward entrega ambos cálculos de forma integrada', () => {
      const reward = calculateMinigameReward(10);
      expect(reward.coins).toBe(30);
      expect(reward.happiness).toBe(20);
    });
  });

  describe('isPointInsideBall', () => {
    const ball = { x: 100, y: 100, radius: 20 };

    it('retorna true para el centro y puntos dentro del radio', () => {
      expect(isPointInsideBall(ball, { x: 100, y: 100 })).toBe(true);
      expect(isPointInsideBall(ball, { x: 110, y: 100 })).toBe(true);
      expect(isPointInsideBall(ball, { x: 100, y: 120 })).toBe(true);
    });

    it('retorna false para puntos fuera del radio', () => {
      expect(isPointInsideBall(ball, { x: 125, y: 100 })).toBe(false);
      expect(isPointInsideBall(ball, { x: 200, y: 200 })).toBe(false);
    });

    it('admite margen de tolerancia ampliado', () => {
      expect(isPointInsideBall(ball, { x: 125, y: 100 }, 10)).toBe(true); // radio 20 + margen 10 = 30
      expect(isPointInsideBall(ball, { x: 135, y: 100 }, 10)).toBe(false);
    });
  });
});
