/**
 * Lógica pura de necesidades y cuidados de la mascota.
 *
 * Contiene las fórmulas matemáticas de decaimiento temporal y las acciones
 * de cuidado (alimentación, baño, caricias). Cumple rigurosamente con:
 * - R-01 (SoC): Dominio puro sin dependencias de UI, DOM o APIs del navegador.
 * - R-03 (Inmutabilidad por Defecto): Todas las funciones son puras y retornan
 *   nuevas instancias inmutables sin modificar los argumentos de entrada.
 * - R-05 (Early Return): Validaciones previas en la cabecera de las funciones.
 */

import type { Inventory, InventoryItem } from '../inventory';
import type { Pet, PetNeeds } from './types';

/**
 * Tasas de decrecimiento por segundo para las necesidades de la mascota.
 * Diseñadas para un ritmo de juego casual donde las barras tardan entre 12 y 24 horas en vaciarse.
 */

/** Tasa base de pérdida de hambre en puntos/segundo (100 puntos en 12 horas ≈ 0.002315 pts/seg). */
export const HUNGER_DECAY_RATE = 100 / (12 * 3600);

/** Tasa base de pérdida de higiene en puntos/segundo (100 puntos en 24 horas ≈ 0.001157 pts/seg). */
export const HYGIENE_DECAY_RATE = 100 / (24 * 3600);

/** Tasa base de pérdida de energía en puntos/segundo (100 puntos en 18 horas ≈ 0.001543 pts/seg). */
export const ENERGY_DECAY_RATE = 100 / (18 * 3600);

/** Tasa base de pérdida de felicidad en puntos/segundo (100 puntos en 16 horas ≈ 0.001736 pts/seg). */
export const HAPPINESS_DECAY_RATE = 100 / (16 * 3600);

/** Multiplicador de pérdida de felicidad cuando el hambre o la higiene caen a nivel crítico (< 30). */
export const HAPPINESS_CRITICAL_DECAY_MULTIPLIER = 2.0;

/** Umbral por debajo del cual una necesidad se considera crítica. */
export const CRITICAL_NEED_THRESHOLD = 30;

/** Valor nutricional por defecto cuando un alimento no especifica nutrition. */
export const DEFAULT_FOOD_NUTRITION = 25;

/** Eficiencia base de incremento de higiene al bañar con jabón/esponja. */
export const DEFAULT_CLEAN_EFFICIENCY = 25;

/** Incremento de felicidad al bañar a la mascota. */
export const DEFAULT_CLEAN_HAPPINESS_BOOST = 5;

/** Incremento de felicidad al acariciar a la mascota. */
export const DEFAULT_PET_HAPPINESS_BOOST = 10;

/**
 * Clampea un valor numérico dentro del rango cerrado [0, 100].
 * Maneja valores inválidos (NaN) devolviendo 0 de forma segura.
 */
export function clampNeed(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
}

/**
 * Calcula el decrecimiento temporal de las necesidades de la mascota tras un tiempo transcurrido.
 *
 * @param currentNeeds Estado actual de necesidades de la mascota.
 * @param elapsedSeconds Segundos transcurridos (en primer plano o ausente/offline).
 * @returns Nueva instancia inmutable de PetNeeds con los valores actualizados y acotados a [0, 100].
 */
export function calculateNeedsDecay(
  currentNeeds: PetNeeds,
  elapsedSeconds: number
): PetNeeds {
  // Early return si no ha transcurrido tiempo válido
  if (elapsedSeconds <= 0 || !Number.isFinite(elapsedSeconds)) {
    return {
      hunger: clampNeed(currentNeeds.hunger),
      hygiene: clampNeed(currentNeeds.hygiene),
      energy: clampNeed(currentNeeds.energy),
      happiness: clampNeed(currentNeeds.happiness),
    };
  }

  // La pérdida de felicidad se duplica si el hambre o la higiene están por debajo de 30
  const isCritical =
    currentNeeds.hunger < CRITICAL_NEED_THRESHOLD ||
    currentNeeds.hygiene < CRITICAL_NEED_THRESHOLD;

  const effectiveHappinessRate = isCritical
    ? HAPPINESS_DECAY_RATE * HAPPINESS_CRITICAL_DECAY_MULTIPLIER
    : HAPPINESS_DECAY_RATE;

  const hunger = clampNeed(currentNeeds.hunger - elapsedSeconds * HUNGER_DECAY_RATE);
  const hygiene = clampNeed(currentNeeds.hygiene - elapsedSeconds * HYGIENE_DECAY_RATE);
  const energy = clampNeed(currentNeeds.energy - elapsedSeconds * ENERGY_DECAY_RATE);
  const happiness = clampNeed(currentNeeds.happiness - elapsedSeconds * effectiveHappinessRate);

  return {
    hunger,
    hygiene,
    energy,
    happiness,
  };
}

/**
 * Alimenta a la mascota utilizando un ítem comestible del inventario.
 *
 * @param pet Mascota a alimentar.
 * @param foodItem Ítem a consumir.
 * @param inventory Inventario actual del jugador.
 * @returns Mascota actualizada e inventario con 1 unidad menos del ítem consumido.
 */
export function feedPet(
  pet: Pet,
  foodItem: InventoryItem,
  inventory: Inventory
): { updatedPet: Pet; updatedInventory: Inventory } {
  // R-05 (Early Return): Validar que el ítem sea de categoría 'food'
  if (foodItem.category !== 'food') {
    return { updatedPet: pet, updatedInventory: inventory };
  }

  // Buscar el ítem en el inventario
  const existingItemIndex = inventory.items.findIndex(
    (item) => item.id === foodItem.id
  );

  if (existingItemIndex === -1) {
    return { updatedPet: pet, updatedInventory: inventory };
  }

  const targetItem = inventory.items[existingItemIndex];
  if (targetItem.quantity <= 0) {
    return { updatedPet: pet, updatedInventory: inventory };
  }

  // Calcular nutrición y nuevo hambre (clamp en 100)
  const nutrition = targetItem.nutrition ?? foodItem.nutrition ?? DEFAULT_FOOD_NUTRITION;
  const newHunger = clampNeed(pet.needs.hunger + nutrition);

  const updatedPet: Pet = {
    ...pet,
    needs: {
      ...pet.needs,
      hunger: newHunger,
    },
  };

  // Descontar 1 unidad del ítem inmutablemente
  const newQuantity = targetItem.quantity - 1;
  const updatedItems =
    newQuantity > 0
      ? inventory.items.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: newQuantity } : item
        )
      : inventory.items.filter((_, index) => index !== existingItemIndex);

  return {
    updatedPet,
    updatedInventory: {
      items: updatedItems,
    },
  };
}

/**
 * Baña y limpia a la mascota con jabón/esponja.
 * Incrementa la higiene y otorga un leve bono de felicidad.
 *
 * @param pet Mascota a bañar.
 * @param soapEfficiency Eficiencia del jabón en puntos (opcional, por defecto 25).
 * @returns Mascota actualizada inmutablemente con valores acotados a [0, 100].
 */
export function cleanPet(pet: Pet, soapEfficiency?: number): Pet {
  const boost =
    soapEfficiency !== undefined && Number.isFinite(soapEfficiency) && soapEfficiency > 0
      ? soapEfficiency
      : DEFAULT_CLEAN_EFFICIENCY;

  const newHygiene = clampNeed(pet.needs.hygiene + boost);
  const newHappiness = clampNeed(pet.needs.happiness + DEFAULT_CLEAN_HAPPINESS_BOOST);

  return {
    ...pet,
    needs: {
      ...pet.needs,
      hygiene: newHygiene,
      happiness: newHappiness,
    },
  };
}

/**
 * Acaricia a la mascota.
 * Incrementa la felicidad de la mascota de forma inmediata.
 *
 * @param pet Mascota a acariciar.
 * @returns Mascota actualizada inmutablemente con felicidad acotada a [0, 100].
 */
export function petAnimal(pet: Pet): Pet {
  const newHappiness = clampNeed(pet.needs.happiness + DEFAULT_PET_HAPPINESS_BOOST);

  return {
    ...pet,
    needs: {
      ...pet.needs,
      happiness: newHappiness,
    },
  };
}
