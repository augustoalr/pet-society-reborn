import { describe, expect, it } from 'vitest';
import {
  calculateWalkAnimationOffsets,
  calculateWalkStep,
  clampToFloor,
  determineFacingDirection,
  isFloorPosition,
  PET_WALK_BOUNDS,
} from '../walkLogic';

describe('walkLogic', () => {
  describe('Floor validation and clamping', () => {
    it('isFloorPosition identifica correctamente el suelo de parquet (Y >= 330)', () => {
      // Coordenadas válidas en el suelo
      expect(isFloorPosition({ x: 400, y: 350 })).toBe(true);
      expect(isFloorPosition({ x: 100, y: 500 })).toBe(true);
      expect(isFloorPosition({ x: 700, y: 330 })).toBe(true);

      // Coordenadas en la pared superior o ventana (Y < 330)
      expect(isFloorPosition({ x: 400, y: 200 })).toBe(false);
      expect(isFloorPosition({ x: 400, y: 0 })).toBe(false);

      // Coordenadas fuera de pantalla o no numéricas
      expect(isFloorPosition({ x: -10, y: 400 })).toBe(false);
      expect(isFloorPosition({ x: 850, y: 400 })).toBe(false);
      expect(isFloorPosition({ x: 400, y: 650 })).toBe(false);
      expect(isFloorPosition({ x: Number.NaN, y: 400 })).toBe(false);
    });

    it('clampToFloor acota destinos a los límites seguros transitables de la mascota', () => {
      const clamped = clampToFloor({ x: 10, y: 200 });
      expect(clamped.x).toBe(PET_WALK_BOUNDS.minX); // 80
      expect(clamped.y).toBe(PET_WALK_BOUNDS.minY); // 340

      const clampedBottomRight = clampToFloor({ x: 900, y: 590 });
      expect(clampedBottomRight.x).toBe(PET_WALK_BOUNDS.maxX); // 720
      expect(clampedBottomRight.y).toBe(PET_WALK_BOUNDS.maxY); // 520

      const safePos = { x: 400, y: 420 };
      expect(clampToFloor(safePos)).toEqual(safePos);
    });
  });

  describe('Facing direction (Flip horizontal)', () => {
    it('retorna 1 (derecha) cuando el objetivo está a la derecha del origen', () => {
      expect(determineFacingDirection(200, 450, 1)).toBe(1);
      expect(determineFacingDirection(200, 450, -1)).toBe(1);
    });

    it('retorna -1 (izquierda) cuando el objetivo está a la izquierda del origen', () => {
      expect(determineFacingDirection(500, 200, 1)).toBe(-1);
      expect(determineFacingDirection(500, 200, -1)).toBe(-1);
    });

    it('conserva la orientación actual si la diferencia está dentro del umbral (deadzone)', () => {
      expect(determineFacingDirection(400, 401, 1, 2)).toBe(1);
      expect(determineFacingDirection(400, 401, -1, 2)).toBe(-1);
      expect(determineFacingDirection(400, 399, -1, 2)).toBe(-1);
    });
  });

  describe('Walk step progression at constant speed', () => {
    const speed = 100; // 100 px/segundo

    it('avanza hacia el objetivo proporcionalmente al delta de tiempo', () => {
      const current = { x: 100, y: 200 };
      const target = { x: 200, y: 200 }; // Distancia = 100 px

      // En 0.5 segundos a 100 px/s, debe avanzar 50 px
      const step1 = calculateWalkStep(current, target, speed, 0.5);
      expect(step1.currentPos.x).toBeCloseTo(150, 1);
      expect(step1.currentPos.y).toBeCloseTo(200, 1);
      expect(step1.arrived).toBe(false);
    });

    it('marca llegada exacta cuando el paso cubre la distancia restante', () => {
      const current = { x: 180, y: 200 };
      const target = { x: 200, y: 200 }; // Distancia = 20 px

      // Paso de 0.5 segundos = 50 px > 20 px
      const step = calculateWalkStep(current, target, speed, 0.5);
      expect(step.currentPos.x).toBe(200);
      expect(step.currentPos.y).toBe(200);
      expect(step.arrived).toBe(true);
    });
  });

  describe('Walk animation offsets (patitas alternas y balanceo)', () => {
    it('genera patitas izquierda y derecha en contrafase exacta (PI radianes)', () => {
      const phase0 = calculateWalkAnimationOffsets(0);
      // En t = 0: sin(0) = 0, sin(PI) = 0
      expect(phase0.leftFootY).toBeCloseTo(0, 2);
      expect(phase0.rightFootY).toBeCloseTo(0, 2);

      const phaseHalfPi = calculateWalkAnimationOffsets(Math.PI / 2);
      // En t = PI/2: sin(PI/2) = 1 (pata izquierda arriba), sin(3PI/2) = -1 (pata derecha abajo)
      expect(phaseHalfPi.leftFootY).toBeCloseTo(6, 1);
      expect(phaseHalfPi.rightFootY).toBeCloseTo(-6, 1);

      // Suma de ambas en cualquier instante con amplitud similar pero signo opuesto
      expect(phaseHalfPi.leftFootY + phaseHalfPi.rightFootY).toBeCloseTo(0, 2);
    });

    it('genera balanceo (waddle tilt) e impulso vertical positivo de rebote', () => {
      const anim = calculateWalkAnimationOffsets(1.5);
      expect(typeof anim.waddleTilt).toBe('number');
      expect(typeof anim.bounceY).toBe('number');
      // El rebote vertical debe ser negativo o cero (desplazamiento hacia arriba en coordenadas de pantalla)
      expect(anim.bounceY).toBeLessThanOrEqual(0);
      // La sombra modula ligeramente su escala
      expect(anim.shadowScaleX).toBeLessThanOrEqual(1.0);
      expect(anim.shadowScaleX).toBeGreaterThan(0.85);
    });
  });
});
