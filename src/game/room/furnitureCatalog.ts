/**
 * Catálogo procedimental de muebles base disponibles en Pet Society.
 *
 * Cada mueble define sus dimensiones vectoriales y su posición por defecto en el suelo.
 */

import type { FurnitureDefinition } from './types';

export const BASE_FURNITURE_CATALOG: readonly FurnitureDefinition[] = [
  {
    id: 'furniture-bed',
    name: 'Cama Cómoda',
    description: 'Cama clásica de madera con sábanas suaves y almohada mullida.',
    category: 'furniture',
    width: 150,
    height: 100,
    defaultPosition: { x: 230, y: 380 },
  },
  {
    id: 'furniture-table',
    name: 'Mesa de Madera',
    description: 'Mesa redonda de té tallada en madera cálida con jarrón decorativo.',
    category: 'furniture',
    width: 100,
    height: 65,
    defaultPosition: { x: 570, y: 400 },
  },
  {
    id: 'furniture-lamp',
    name: 'Lámpara de Pie',
    description: 'Lámpara elegante con base dorada, pantalla pastel y luz acogedora.',
    category: 'furniture',
    width: 60,
    height: 140,
    defaultPosition: { x: 120, y: 390 },
  },
  {
    id: 'furniture-plant',
    name: 'Planta de Interior',
    description: 'Maceta de terracota con hojas verdes y vibrantes tipo monstera.',
    category: 'furniture',
    width: 70,
    height: 90,
    defaultPosition: { x: 680, y: 390 },
  },
];

/**
 * Obtiene la definición de un mueble a partir de su ID.
 * Si el ID contiene un sufijo (por ejemplo 'furniture-bed-1'), busca por prefijo base.
 */
export function getFurnitureDefinition(itemId: string): FurnitureDefinition | undefined {
  const directMatch = BASE_FURNITURE_CATALOG.find((f) => f.id === itemId);
  if (directMatch) {
    return directMatch;
  }

  // Buscar por prefijo base si es una instancia específica
  return BASE_FURNITURE_CATALOG.find((f) => itemId.startsWith(f.id));
}
