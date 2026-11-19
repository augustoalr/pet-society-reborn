import { describe, it, expect } from 'vitest';

describe('Smoke test - Vitest runner', () => {
  it('debe ejecutar una prueba unitaria básica y verificar que el entorno funciona', () => {
    const sum = (a: number, b: number): number => a + b;
    expect(sum(2, 3)).toBe(5);
  });
});
