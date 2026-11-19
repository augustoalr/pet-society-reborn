import { VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './constants';

/**
 * Resultado del cálculo de escalado del viewport.
 *
 * - `width` / `height`: tamaño real del canvas en píxeles CSS.
 * - `scale`: factor de escala uniforme aplicado al contenido virtual.
 * - `offsetX` / `offsetY`: desplazamiento para centrar el lienzo
 *   cuando sobra espacio (letterbox vertical u horizontal).
 */
export interface ViewportScaleResult {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly offsetX: number;
  readonly offsetY: number;
}

/**
 * Calcula el factor de escala uniforme para ajustar la resolución virtual
 * al contenedor disponible sin recortar ni deformar (modo "fit").
 *
 * Si el contenedor es más ancho que el ratio virtual, aparecen barras
 * laterales (pillarbox). Si es más alto, barras arriba/abajo (letterbox).
 *
 * @param containerWidth  Ancho del contenedor en píxeles CSS (≥ 0).
 * @param containerHeight Alto del contenedor en píxeles CSS (≥ 0).
 * @returns Dimensiones, escala y offsets para posicionar el canvas.
 */
export function calculateViewportScale(
  containerWidth: number,
  containerHeight: number,
): ViewportScaleResult {
  // Precondición: dimensiones nulas o negativas → escala cero, nada que pintar.
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { width: 0, height: 0, scale: 0, offsetX: 0, offsetY: 0 };
  }

  const scaleX = containerWidth / VIRTUAL_WIDTH;
  const scaleY = containerHeight / VIRTUAL_HEIGHT;

  // Tomamos el menor para que todo el contenido quepa sin recortarse.
  const scale = Math.min(scaleX, scaleY);

  const width = Math.floor(VIRTUAL_WIDTH * scale);
  const height = Math.floor(VIRTUAL_HEIGHT * scale);

  // Centramos el lienzo dentro del contenedor sobrante.
  const offsetX = Math.floor((containerWidth - width) / 2);
  const offsetY = Math.floor((containerHeight - height) / 2);

  return { width, height, scale, offsetX, offsetY };
}
