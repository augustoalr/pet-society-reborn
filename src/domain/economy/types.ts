/**
 * Modelos de dominio inmutables para la economía del juego.
 *
 * Economía dual:
 * - `coins`: moneda regular ganada en minijuegos y recompensas.
 * - `cash`: moneda premium preparada para monetización futura.
 */

export interface Wallet {
  readonly coins: number;
  readonly cash: number;
}
