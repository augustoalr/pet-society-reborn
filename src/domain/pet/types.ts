/**
 * Modelos de dominio inmutables para la mascota.
 *
 * Todas las propiedades son `readonly` para garantizar inmutabilidad:
 * el estado no se muta directamente, se producen nuevas instancias.
 */

/** Necesidades de la mascota. Cada valor va de 0 (vacío) a 100 (lleno). */
export interface PetNeeds {
  readonly hunger: number;
  readonly hygiene: number;
  readonly energy: number;
  readonly happiness: number;
}

/** Colores válidos para el cuerpo de la mascota. */
export type PetColor =
  | 'white'
  | 'brown'
  | 'black'
  | 'pink'
  | 'gray'
  | 'orange';

/** Variantes de rasgos faciales y corporales. */
export type EyeStyle = 'round' | 'sleepy' | 'happy' | 'star';
export type MouthStyle = 'smile' | 'open' | 'neutral';
export type EarStyle = 'floppy' | 'pointy' | 'round';

/** Ranuras de ropa o accesorios equipables. */
export type ClothingSlot = 'hat' | 'shirt' | 'accessory';

/** Identificador de prenda o accesorio. */
export type ClothingItemId = string;

/** Configuración de prendas equipadas en la mascota. */
export interface PetClothes {
  readonly hat?: ClothingItemId | null;
  readonly shirt?: ClothingItemId | null;
  readonly accessory?: ClothingItemId | null;
}

/** Configuración visual de la mascota. */
export interface PetAppearance {
  readonly color: PetColor;
  readonly eyes: EyeStyle;
  readonly mouth: MouthStyle;
  readonly ears: EarStyle;
}

/** Entidad raíz de la mascota. */
export interface Pet {
  readonly id: string;
  readonly name: string;
  readonly appearance: PetAppearance;
  readonly clothes?: PetClothes;
  readonly needs: PetNeeds;
  readonly level: number;
}
