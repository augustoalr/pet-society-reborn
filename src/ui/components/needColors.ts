import { theme } from '../../styles';

/**
 * Determina el token de color semántico según el valor de la necesidad:
 * - > 60%: verde (statusGood)
 * - 30% a 60%: amarillo/ámbar (statusWarning)
 * - < 30%: rojo (statusDanger)
 */
export function getNeedSemanticColor(value: number): string {
  if (value > 60) {
    return theme.colors.statusGood;
  }
  if (value >= 30) {
    return theme.colors.statusWarning;
  }
  return theme.colors.statusDanger;
}
