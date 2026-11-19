/**
 * Resolución virtual fija del juego.
 *
 * Todo el contenido del juego se diseña para este "lienzo lógico".
 * El motor escala uniformemente este rectángulo para caber en el
 * contenedor real del navegador sin recortar ni deformar (letterbox / pillarbox).
 */
export const VIRTUAL_WIDTH = 800;
export const VIRTUAL_HEIGHT = 600;
export const VIRTUAL_ASPECT_RATIO = VIRTUAL_WIDTH / VIRTUAL_HEIGHT; // 4:3
