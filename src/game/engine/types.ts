/**
 * Tipos de eventos de puntero unificados que abstrae el motor gráfico.
 *
 * Estos eventos unifican mouse y touch para que las capas superiores
 * no dependan directamente de la API de eventos de PixiJS.
 */
export type GamePointerEventType = 'pointerdown' | 'pointerup' | 'pointermove';

export interface GamePointerEvent {
  /** Tipo del evento (down, up, move). */
  readonly type: GamePointerEventType;
  /** Coordenada X en el espacio virtual del juego (0..VIRTUAL_WIDTH). */
  readonly virtualX: number;
  /** Coordenada Y en el espacio virtual del juego (0..VIRTUAL_HEIGHT). */
  readonly virtualY: number;
}

export type GamePointerEventHandler = (event: GamePointerEvent) => void;
