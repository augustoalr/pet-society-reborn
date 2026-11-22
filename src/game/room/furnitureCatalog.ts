/**
 * Catálogo procedimental de muebles base y decoraciones disponibles en Pet Society.
 *
 * Cada mueble define sus dimensiones vectoriales, capa de colocación (suelo vs pared)
 * y su posición por defecto en la habitación.
 */

import type { FurnitureDefinition } from './types';

export const BASE_FURNITURE_CATALOG: readonly FurnitureDefinition[] = [
  {
    id: 'furniture-bed',
    name: 'Cama Cómoda',
    description: 'Cama clásica de madera con sábanas suaves y almohada mullida.',
    category: 'furniture',
    placementLayer: 'floor',
    width: 150,
    height: 100,
    defaultPosition: { x: 200, y: 365 },
  },
  {
    id: 'furniture-table',
    name: 'Mesa de Madera',
    description: 'Mesa redonda de té tallada en madera cálida con jarrón decorativo.',
    category: 'furniture',
    placementLayer: 'floor',
    width: 100,
    height: 65,
    defaultPosition: { x: 600, y: 415 },
  },
  {
    id: 'furniture-lamp',
    name: 'Lámpara de Pie',
    description: 'Lámpara elegante con base dorada, pantalla pastel y luz acogedora.',
    category: 'furniture',
    placementLayer: 'floor',
    width: 60,
    height: 140,
    defaultPosition: { x: 120, y: 415 },
  },
  {
    id: 'furniture-plant',
    name: 'Planta de Interior',
    description: 'Maceta de terracota con hojas verdes y vibrantes tipo monstera.',
    category: 'furniture',
    placementLayer: 'floor',
    width: 70,
    height: 90,
    defaultPosition: { x: 680, y: 415 },
  },
];

export const BASE_WALL_CATALOG: readonly FurnitureDefinition[] = [
  {
    id: 'wall-painting',
    name: 'Cuadro de Paisaje',
    description: 'Pintura al óleo con colinas verdes enmarcada en madera dorada.',
    category: 'furniture',
    placementLayer: 'wall',
    width: 90,
    height: 70,
    defaultPosition: { x: 250, y: 160 },
  },
  {
    id: 'wall-window',
    name: 'Ventana de Madera',
    description: 'Ventana rústica de madera de casa de muñecas con cortinas.',
    category: 'furniture',
    placementLayer: 'wall',
    width: 110,
    height: 130,
    defaultPosition: { x: 400, y: 145 },
  },
  {
    id: 'wall-clock',
    name: 'Reloj de Péndulo',
    description: 'Clásico reloj de pared de caoba con manecillas doradas.',
    category: 'furniture',
    placementLayer: 'wall',
    width: 50,
    height: 80,
    defaultPosition: { x: 550, y: 160 },
  },
];

/**
 * Obtiene la definición de un mueble a partir de su ID.
 * Si el ID contiene un sufijo (por ejemplo 'furniture-bed-1'), busca por prefijo base.
 */
export function getFurnitureDefinition(itemId: string): FurnitureDefinition | undefined {
  const directMatch =
    BASE_FURNITURE_CATALOG.find((f) => f.id === itemId) ??
    BASE_WALL_CATALOG.find((f) => f.id === itemId);

  if (directMatch) {
    return directMatch;
  }

  // Buscar por prefijo base si es una instancia específica
  return (
    BASE_FURNITURE_CATALOG.find((f) => itemId.startsWith(f.id)) ??
    BASE_WALL_CATALOG.find((f) => itemId.startsWith(f.id))
  );
}
