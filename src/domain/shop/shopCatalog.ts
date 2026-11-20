/**
 * Catálogo base de la Tienda de Ítems de Pet Society (T-08).
 *
 * Contiene una oferta balanceada para el MVP:
 * - Comida: Alimentos de distintos valores nutricionales en monedas y cash.
 * - Ropa / Accesorios: Prendas de distintas ranuras (sombreros, camisas, accesorios).
 * - Muebles: Elementos decorativos compatibles con la habitación de T-07.
 */

import type { ShopCategory, ShopItem } from './types';

export const SHOP_CATALOG: readonly ShopItem[] = [
  // ==========================================
  // COMIDA (FOOD)
  // ==========================================
  {
    id: 'food-apple',
    name: 'Manzana Fresca',
    category: 'food',
    description: 'Una manzana roja jugosa y crujiente recién cosechada.',
    price: { coins: 10 },
    icon: '🍎',
    nutrition: 20,
  },
  {
    id: 'food-bread',
    name: 'Panecillo Tierno',
    category: 'food',
    description: 'Pan artesanal recién horneado, dorado y aromático.',
    price: { coins: 15 },
    icon: '🍞',
    nutrition: 35,
  },
  {
    id: 'food-cookie',
    name: 'Galleta con Chispas',
    category: 'food',
    description: 'Deliciosa galleta dulce rellena de gotas de chocolate.',
    price: { coins: 8 },
    icon: '🍪',
    nutrition: 15,
  },
  {
    id: 'food-sushi',
    name: 'Sushi Variado',
    category: 'food',
    description: 'Delicado bocado de salmón fresco con arroz sazonado.',
    price: { coins: 30 },
    icon: '🍣',
    nutrition: 50,
  },
  {
    id: 'food-cake',
    name: 'Porción de Pastel',
    category: 'food',
    description: 'Tarta esponjosa con crema de fresas para días especiales.',
    price: { coins: 25 },
    icon: '🍰',
    nutrition: 40,
  },
  {
    id: 'food-golden-apple',
    name: 'Manzana Dorada',
    category: 'food',
    description: 'Fruta mística y resplandeciente que sacia completamente el apetito.',
    price: { cash: 2 },
    icon: '🌟',
    nutrition: 100,
  },

  // ==========================================
  // ROPA Y ACCESORIOS (CLOTHES)
  // ==========================================
  {
    id: 'party-hat',
    name: 'Gorro de Fiesta',
    category: 'clothes',
    description: 'Cono festivo morado y amarillo con un pompón alegre.',
    price: { coins: 40 },
    icon: '🎉',
    clothingSlot: 'hat',
  },
  {
    id: 'cap',
    name: 'Gorra Deportiva',
    category: 'clothes',
    description: 'Gorra moderna con visera azul para pasear con estilo.',
    price: { coins: 35 },
    icon: '🧢',
    clothingSlot: 'hat',
  },
  {
    id: 'red-shirt',
    name: 'Camiseta Roja',
    category: 'clothes',
    description: 'Camiseta casual de algodón suave de color rojo vivo.',
    price: { coins: 50 },
    icon: '👕',
    clothingSlot: 'shirt',
  },
  {
    id: 'blue-shirt',
    name: 'Camiseta Azul',
    category: 'clothes',
    description: 'Camiseta clásica de color azul marino con cuello blanco.',
    price: { coins: 50 },
    icon: '👔',
    clothingSlot: 'shirt',
  },
  {
    id: 'bowtie',
    name: 'Pajarita Elegante',
    category: 'clothes',
    description: 'Pajarita roja de etiqueta para eventos y visitas sofisticadas.',
    price: { coins: 30 },
    icon: '🎀',
    clothingSlot: 'accessory',
  },
  {
    id: 'glasses',
    name: 'Gafas Clásicas',
    category: 'clothes',
    description: 'Montura circular oscura para un look inteligente y curioso.',
    price: { coins: 45 },
    icon: '👓',
    clothingSlot: 'accessory',
  },
  {
    id: 'crown',
    name: 'Corona Real',
    category: 'clothes',
    description: 'Corona dorada con gemas resplandecientes para la realeza de la casa.',
    price: { cash: 5 },
    icon: '👑',
    clothingSlot: 'hat',
  },

  // ==========================================
  // MUEBLES (FURNITURE)
  // ==========================================
  {
    id: 'furniture-bed',
    name: 'Cama Cómoda',
    category: 'furniture',
    description: 'Cama clásica de madera con sábanas suaves y almohada mullida.',
    price: { coins: 80 },
    icon: '🛏️',
    furnitureId: 'furniture-bed',
  },
  {
    id: 'furniture-table',
    name: 'Mesa de Madera',
    category: 'furniture',
    description: 'Mesa redonda de té tallada en madera cálida con jarrón decorativo.',
    price: { coins: 50 },
    icon: '🪵',
    furnitureId: 'furniture-table',
  },
  {
    id: 'furniture-lamp',
    name: 'Lámpara de Pie',
    category: 'furniture',
    description: 'Lámpara elegante con base dorada, pantalla pastel y luz acogedora.',
    price: { coins: 40 },
    icon: '💡',
    furnitureId: 'furniture-lamp',
  },
  {
    id: 'furniture-plant',
    name: 'Planta de Interior',
    category: 'furniture',
    description: 'Maceta de terracota con hojas verdes y vibrantes tipo monstera.',
    price: { coins: 35 },
    icon: '🪴',
    furnitureId: 'furniture-plant',
  },
  {
    id: 'furniture-luxury-bed',
    name: 'Cama Imperial',
    category: 'furniture',
    description: 'Cama de lujo con dosel aterciopelado para el descanso más exclusivo.',
    price: { cash: 10 },
    icon: '✨🛏️',
    furnitureId: 'furniture-bed',
  },
];

/**
 * Obtiene la definición de un ítem de la tienda a partir de su ID.
 */
export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_CATALOG.find((item) => item.id === id);
}

/**
 * Filtra los ítems del catálogo según su categoría.
 */
export function getShopItemsByCategory(category: ShopCategory): readonly ShopItem[] {
  return SHOP_CATALOG.filter((item) => item.category === category);
}
