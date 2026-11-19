import { describe, it, expect } from 'vitest';
import { getNeedSemanticColor } from '../needColors';
import { theme } from '../../../styles';

describe('needColors (Tokens Semánticos de Necesidades)', () => {
  it('retorna statusGood (verde) para valores estrictamente mayores al 60%', () => {
    expect(getNeedSemanticColor(61)).toBe(theme.colors.statusGood);
    expect(getNeedSemanticColor(80)).toBe(theme.colors.statusGood);
    expect(getNeedSemanticColor(100)).toBe(theme.colors.statusGood);
  });

  it('retorna statusWarning (ámbar/amarillo) para valores entre 30% y 60% inclusive', () => {
    expect(getNeedSemanticColor(60)).toBe(theme.colors.statusWarning);
    expect(getNeedSemanticColor(45)).toBe(theme.colors.statusWarning);
    expect(getNeedSemanticColor(30)).toBe(theme.colors.statusWarning);
  });

  it('retorna statusDanger (rojo) para valores estrictamente menores al 30%', () => {
    expect(getNeedSemanticColor(29)).toBe(theme.colors.statusDanger);
    expect(getNeedSemanticColor(10)).toBe(theme.colors.statusDanger);
    expect(getNeedSemanticColor(0)).toBe(theme.colors.statusDanger);
  });
});
