import { describe, it, expect } from 'vitest';
import { calculateViewportScale } from '../calculateViewportScale';
import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../constants';

describe('calculateViewportScale', () => {
  it('escala correctamente en un contenedor que coincide exactamente con la resolución virtual', () => {
    const result = calculateViewportScale(VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    expect(result.scale).toBe(1);
    expect(result.width).toBe(VIRTUAL_WIDTH);
    expect(result.height).toBe(VIRTUAL_HEIGHT);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(0);
  });

  it('escala uniformemente en pantalla panorámica (16:9) → pillarbox lateral', () => {
    // 1920×1080 es más ancho que 4:3 → la altura limita la escala
    const result = calculateViewportScale(1920, 1080);

    expect(result.scale).toBe(1080 / VIRTUAL_HEIGHT); // 1.8
    expect(result.height).toBe(1080);
    // El ancho escalado es 800 × 1.8 = 1440, centrado en 1920
    expect(result.width).toBe(Math.floor(VIRTUAL_WIDTH * result.scale));
    expect(result.offsetX).toBe(Math.floor((1920 - result.width) / 2));
    expect(result.offsetY).toBe(0);
  });

  it('escala uniformemente en pantalla ultrawide (21:9) → pillarbox mayor', () => {
    const result = calculateViewportScale(2560, 1080);

    // La altura sigue siendo el factor limitante
    expect(result.scale).toBe(1080 / VIRTUAL_HEIGHT);
    expect(result.height).toBe(1080);
    // Más espacio horizontal sobrante que en 16:9
    expect(result.offsetX).toBeGreaterThan(0);
    expect(result.offsetY).toBe(0);
  });

  it('escala correctamente en un móvil vertical (9:16, 390×844) → letterbox', () => {
    // Más alto que ancho → el ancho limita la escala
    const result = calculateViewportScale(390, 844);

    expect(result.scale).toBe(390 / VIRTUAL_WIDTH); // ≈ 0.4875
    expect(result.width).toBe(390); // ajusta al ancho del contenedor
    expect(result.height).toBeLessThan(844);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBeGreaterThan(0);
  });

  it('mantiene la proporción correcta en una pantalla cuadrada (1:1)', () => {
    const result = calculateViewportScale(600, 600);

    // El ancho virtual (800) no cabe en 600 → escala por ancho
    expect(result.scale).toBe(600 / VIRTUAL_WIDTH); // 0.75
    expect(result.width).toBe(600);
    expect(result.height).toBe(Math.floor(VIRTUAL_HEIGHT * result.scale)); // 450
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(Math.floor((600 - result.height) / 2));
  });

  it('devuelve escala cero cuando el contenedor tiene ancho cero', () => {
    const result = calculateViewportScale(0, 500);

    expect(result.scale).toBe(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('devuelve escala cero cuando el contenedor tiene alto cero', () => {
    const result = calculateViewportScale(500, 0);

    expect(result.scale).toBe(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('devuelve escala cero cuando ambas dimensiones son cero', () => {
    const result = calculateViewportScale(0, 0);

    expect(result.scale).toBe(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('devuelve escala cero cuando las dimensiones son negativas', () => {
    const result = calculateViewportScale(-100, -200);

    expect(result.scale).toBe(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
  });

  it('maneja dimensiones muy pequeñas (1×1) sin errores', () => {
    const result = calculateViewportScale(1, 1);

    expect(result.scale).toBeGreaterThan(0);
    expect(result.scale).toBeLessThan(1);
    expect(result.width).toBeGreaterThanOrEqual(0);
    expect(result.height).toBeGreaterThanOrEqual(0);
  });

  it('nunca produce un ancho o alto mayor que el contenedor', () => {
    const testCases = [
      [1920, 1080],
      [390, 844],
      [600, 600],
      [2560, 1440],
      [320, 568],
      [1024, 768],
    ] as const;

    for (const [cw, ch] of testCases) {
      const result = calculateViewportScale(cw, ch);
      expect(result.width).toBeLessThanOrEqual(cw);
      expect(result.height).toBeLessThanOrEqual(ch);
    }
  });

  it('escala al doble exacto cuando el contenedor es exactamente 2× la resolución virtual', () => {
    const result = calculateViewportScale(VIRTUAL_WIDTH * 2, VIRTUAL_HEIGHT * 2);

    expect(result.scale).toBe(2);
    expect(result.width).toBe(VIRTUAL_WIDTH * 2);
    expect(result.height).toBe(VIRTUAL_HEIGHT * 2);
    expect(result.offsetX).toBe(0);
    expect(result.offsetY).toBe(0);
  });
});
