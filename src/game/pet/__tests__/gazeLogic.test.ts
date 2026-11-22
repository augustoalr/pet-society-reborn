import { describe, expect, it } from 'vitest';
import {
  calculatePupilOffset,
  createBlinkState,
  updateBlinkState,
} from '../gazeLogic';

describe('gazeLogic', () => {
  describe('Blink state machine', () => {
    it('createBlinkState genera temporizador aleatorio entre 3 y 5 segundos', () => {
      // Con random = 0, el intervalo debe ser exactamente 3
      const minState = createBlinkState(() => 0);
      expect(minState.timeUntilNextBlink).toBe(3);
      expect(minState.isBlinking).toBe(false);

      // Con random = 1, el intervalo debe ser exactamente 5
      const maxState = createBlinkState(() => 1);
      expect(maxState.timeUntilNextBlink).toBe(5);

      // Con random = 0.5, intervalo 4
      const midState = createBlinkState(() => 0.5);
      expect(midState.timeUntilNextBlink).toBe(4);
    });

    it('updateBlinkState descuenta tiempo y activa el parpadeo al expirar', () => {
      const state = createBlinkState(() => 0); // 3 segundos
      expect(state.timeUntilNextBlink).toBe(3);

      // Avanzar 2 segundos (aún no parpadea)
      const res1 = updateBlinkState(state, 2, () => 0);
      expect(res1.state.timeUntilNextBlink).toBe(1);
      expect(res1.state.isBlinking).toBe(false);
      expect(res1.blinkProgress).toBe(0);

      // Avanzar 1.1 segundos más (supera los 3s totales)
      const res2 = updateBlinkState(res1.state, 1.1, () => 0.5);
      expect(res2.state.isBlinking).toBe(true);
      expect(res2.state.blinkElapsed).toBe(0);
      expect(res2.blinkProgress).toBe(0);
    });

    it('updateBlinkState calcula la curva senoidal y finaliza el parpadeo', () => {
      const state = {
        timeUntilNextBlink: 0,
        isBlinking: true,
        blinkElapsed: 0,
        blinkDuration: 0.16,
      };

      // Al 50% de la duración (t = 0.08 / 0.16 = 0.5), el progreso debe ser el pico 1.0 (sin(PI/2))
      const midRes = updateBlinkState(state, 0.08, () => 0);
      expect(midRes.blinkProgress).toBeCloseTo(1.0, 2);
      expect(midRes.state.isBlinking).toBe(true);

      // Al completar la duración (0.08 + 0.09 > 0.16)
      const endRes = updateBlinkState(midRes.state, 0.09, () => 0.25);
      expect(endRes.state.isBlinking).toBe(false);
      expect(endRes.blinkProgress).toBe(0);
      // El siguiente parpadeo queda programado entre 3 y 5s (3 + 0.25*2 = 3.5s)
      expect(endRes.state.timeUntilNextBlink).toBe(3.5);
    });
  });

  describe('Pupil offset calculation (Mirada reactiva)', () => {
    const petPos = { x: 400, y: 350 };
    const eyeOffset = { x: 0, y: -26 };
    // Centro del ojo en coordenadas mundiales: (400, 324)

    it('retorna (0, 0) cuando el cursor es null o está inactivo', () => {
      const offset = calculatePupilOffset(petPos, 1, null);
      expect(offset).toEqual({ x: 0, y: 0 });
    });

    it('retorna (0, 0) cuando el cursor coincide exactamente con el centro del ojo', () => {
      const offset = calculatePupilOffset(petPos, 1, { x: 400, y: 324 });
      expect(offset.x).toBeCloseTo(0, 2);
      expect(offset.y).toBeCloseTo(0, 2);
    });

    it('calcula desplazamiento hacia la derecha cuando el cursor está a la derecha', () => {
      const cursor = { x: 600, y: 324 };
      const offset = calculatePupilOffset(petPos, 1, cursor, { maxRadius: 4 });
      expect(offset.x).toBeCloseTo(4, 1);
      expect(offset.y).toBeCloseTo(0, 1);
    });

    it('calcula desplazamiento hacia arriba cuando el cursor está arriba', () => {
      const cursor = { x: 400, y: 100 };
      const offset = calculatePupilOffset(petPos, 1, cursor, { maxRadius: 4 });
      expect(offset.x).toBeCloseTo(0, 1);
      expect(offset.y).toBeCloseTo(-4, 1);
    });

    it('invierte el eje X local cuando la mascota tiene flip horizontal (scaleX = -1)', () => {
      // El cursor está a la derecha en el mundo
      const cursor = { x: 600, y: 324 };

      // Con scaleX = 1: localX es positivo (+4)
      const offsetRight = calculatePupilOffset(petPos, 1, cursor, { maxRadius: 4 });
      expect(offsetRight.x).toBeCloseTo(4, 1);

      // Con scaleX = -1: localX debe ser negativo (-4) para que en el mundo (-4 * -1) mire a la derecha
      const offsetFlipped = calculatePupilOffset(petPos, -1, cursor, { maxRadius: 4 });
      expect(offsetFlipped.x).toBeCloseTo(-4, 1);
    });

    it('acota el desplazamiento dentro del radio máximo configurado', () => {
      const farCursor = { x: 10000, y: 5000 };
      const maxRadius = 3.5;
      const offset = calculatePupilOffset(petPos, 1, farCursor, { maxRadius, eyeCenterOffset: eyeOffset });
      const distance = Math.hypot(offset.x, offset.y);
      expect(distance).toBeLessThanOrEqual(maxRadius + 0.001);
    });
  });
});
