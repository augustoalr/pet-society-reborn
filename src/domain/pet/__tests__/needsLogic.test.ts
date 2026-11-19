import { describe, it, expect } from 'vitest';
import {
  calculateNeedsDecay,
  feedPet,
  cleanPet,
  petAnimal,
  clampNeed,
  HUNGER_DECAY_RATE,
  HYGIENE_DECAY_RATE,
  ENERGY_DECAY_RATE,
  HAPPINESS_DECAY_RATE,
  HAPPINESS_CRITICAL_DECAY_MULTIPLIER,
  CRITICAL_NEED_THRESHOLD,
  DEFAULT_FOOD_NUTRITION,
  DEFAULT_CLEAN_EFFICIENCY,
  DEFAULT_CLEAN_HAPPINESS_BOOST,
  DEFAULT_PET_HAPPINESS_BOOST,
} from '../needsLogic';
import type { Pet, PetAppearance, PetNeeds } from '../types';
import type { Inventory, InventoryItem } from '../../inventory';

describe('needsLogic (Dominio de Necesidades y Cuidados)', () => {
  const baseAppearance: PetAppearance = {
    color: 'pink',
    eyes: 'round',
    mouth: 'smile',
    ears: 'floppy',
  };

  const basePet: Pet = Object.freeze({
    id: 'test-pet',
    name: 'Mochi',
    appearance: baseAppearance,
    clothes: {
      hat: null,
      shirt: null,
      accessory: null,
    },
    needs: Object.freeze({
      hunger: 80,
      hygiene: 80,
      energy: 80,
      happiness: 80,
    }),
    level: 1,
  });

  const sampleFood: InventoryItem = Object.freeze({
    id: 'food-apple',
    name: 'Manzana',
    category: 'food',
    quantity: 3,
    nutrition: 20,
  });

  const singleFood: InventoryItem = Object.freeze({
    id: 'food-berry',
    name: 'Baya',
    category: 'food',
    quantity: 1,
    nutrition: 15,
  });

  const baseInventory: Inventory = Object.freeze({
    items: Object.freeze([sampleFood, singleFood]),
  });

  // ─── clampNeed ─────────────────────────────────────────────

  describe('clampNeed', () => {
    it('mantiene valores dentro de [0, 100]', () => {
      expect(clampNeed(50)).toBe(50);
      expect(clampNeed(0)).toBe(0);
      expect(clampNeed(100)).toBe(100);
    });

    it('acota valores negativos a 0', () => {
      expect(clampNeed(-15)).toBe(0);
    });

    it('acota valores mayores a 100 en 100', () => {
      expect(clampNeed(125)).toBe(100);
    });

    it('maneja NaN retornando 0 de forma segura', () => {
      expect(clampNeed(Number.NaN)).toBe(0);
    });
  });

  // ─── calculateNeedsDecay ───────────────────────────────────

  describe('calculateNeedsDecay', () => {
    it('retorna las mismas necesidades si el tiempo transcurrido es 0 o negativo', () => {
      const needs: PetNeeds = { hunger: 50, hygiene: 50, energy: 50, happiness: 50 };
      expect(calculateNeedsDecay(needs, 0)).toEqual(needs);
      expect(calculateNeedsDecay(needs, -100)).toEqual(needs);
    });

    it('calcula el decaimiento exacto tras un intervalo de tiempo', () => {
      const initialNeeds: PetNeeds = { hunger: 80, hygiene: 80, energy: 80, happiness: 80 };
      const elapsedSeconds = 3600; // 1 hora

      const updated = calculateNeedsDecay(initialNeeds, elapsedSeconds);

      const expectedHunger = 80 - elapsedSeconds * HUNGER_DECAY_RATE;
      const expectedHygiene = 80 - elapsedSeconds * HYGIENE_DECAY_RATE;
      const expectedEnergy = 80 - elapsedSeconds * ENERGY_DECAY_RATE;
      const expectedHappiness = 80 - elapsedSeconds * HAPPINESS_DECAY_RATE;

      expect(updated.hunger).toBeCloseTo(expectedHunger, 5);
      expect(updated.hygiene).toBeCloseTo(expectedHygiene, 5);
      expect(updated.energy).toBeCloseTo(expectedEnergy, 5);
      expect(updated.happiness).toBeCloseTo(expectedHappiness, 5);
    });

    it('acelera la pérdida de felicidad si el hambre está en nivel crítico (< 30)', () => {
      const normalNeeds: PetNeeds = { hunger: 50, hygiene: 50, energy: 50, happiness: 80 };
      const hungryNeeds: PetNeeds = {
        hunger: CRITICAL_NEED_THRESHOLD - 10,
        hygiene: 50,
        energy: 50,
        happiness: 80,
      };
      const elapsedSeconds = 1800;

      const normalResult = calculateNeedsDecay(normalNeeds, elapsedSeconds);
      const hungryResult = calculateNeedsDecay(hungryNeeds, elapsedSeconds);

      const normalLoss = 80 - normalResult.happiness;
      const hungryLoss = 80 - hungryResult.happiness;

      expect(hungryLoss).toBeCloseTo(normalLoss * HAPPINESS_CRITICAL_DECAY_MULTIPLIER, 4);
    });

    it('acelera la pérdida de felicidad si la higiene está en nivel crítico (< 30)', () => {
      const dirtyNeeds: PetNeeds = { hunger: 50, hygiene: 15, energy: 50, happiness: 80 };
      const elapsedSeconds = 1800;

      const result = calculateNeedsDecay(dirtyNeeds, elapsedSeconds);
      const loss = 80 - result.happiness;
      const expectedLoss = elapsedSeconds * HAPPINESS_DECAY_RATE * HAPPINESS_CRITICAL_DECAY_MULTIPLIER;

      expect(loss).toBeCloseTo(expectedLoss, 4);
    });

    it('no decae por debajo de 0 incluso tras un tiempo ausente extremadamente largo (offline)', () => {
      const initialNeeds: PetNeeds = { hunger: 50, hygiene: 50, energy: 50, happiness: 50 };
      const oneYearInSeconds = 365 * 24 * 3600;

      const decayed = calculateNeedsDecay(initialNeeds, oneYearInSeconds);

      expect(decayed.hunger).toBe(0);
      expect(decayed.hygiene).toBe(0);
      expect(decayed.energy).toBe(0);
      expect(decayed.happiness).toBe(0);
    });

    it('garantiza inmutabilidad y no muta el objeto PetNeeds original', () => {
      const frozenNeeds: PetNeeds = Object.freeze({
        hunger: 70,
        hygiene: 70,
        energy: 70,
        happiness: 70,
      });

      expect(() => calculateNeedsDecay(frozenNeeds, 3600)).not.toThrow();
      expect(frozenNeeds.hunger).toBe(70);
    });
  });

  // ─── feedPet ───────────────────────────────────────────────

  describe('feedPet', () => {
    it('incrementa el hambre según el valor nutricional del alimento', () => {
      const { updatedPet, updatedInventory } = feedPet(basePet, sampleFood, baseInventory);

      expect(updatedPet.needs.hunger).toBe(100); // 80 + 20 = 100
      expect(updatedInventory.items.find((i) => i.id === 'food-apple')?.quantity).toBe(2);
    });

    it('usa el valor por defecto de nutrición si el ítem no lo especifica', () => {
      const foodWithoutNutrition: InventoryItem = {
        id: 'food-snack',
        name: 'Snack',
        category: 'food',
        quantity: 2,
      };
      const inv: Inventory = { items: [foodWithoutNutrition] };
      const petWithLowHunger: Pet = {
        ...basePet,
        needs: { ...basePet.needs, hunger: 10 },
      };

      const { updatedPet, updatedInventory } = feedPet(
        petWithLowHunger,
        foodWithoutNutrition,
        inv
      );

      expect(updatedPet.needs.hunger).toBe(10 + DEFAULT_FOOD_NUTRITION);
      expect(updatedInventory.items[0].quantity).toBe(1);
    });

    it('no sobrepasa el límite máximo de 100 de hambre', () => {
      const petAlmostFull: Pet = {
        ...basePet,
        needs: { ...basePet.needs, hunger: 95 },
      };

      const { updatedPet } = feedPet(petAlmostFull, sampleFood, baseInventory);
      expect(updatedPet.needs.hunger).toBe(100);
    });

    it('elimina el ítem del inventario cuando la cantidad llega a 0', () => {
      const { updatedInventory } = feedPet(basePet, singleFood, baseInventory);

      const found = updatedInventory.items.find((i) => i.id === 'food-berry');
      expect(found).toBeUndefined();
      expect(updatedInventory.items.length).toBe(1);
    });

    it('retorna pet e inventario intactos si el ítem no pertenece a la categoría food', () => {
      const toyItem: InventoryItem = {
        id: 'toy-ball',
        name: 'Pelota',
        category: 'toy',
        quantity: 1,
      };
      const inv: Inventory = { items: [toyItem] };

      const { updatedPet, updatedInventory } = feedPet(basePet, toyItem, inv);

      expect(updatedPet).toBe(basePet);
      expect(updatedInventory).toBe(inv);
    });

    it('retorna pet e inventario intactos si el ítem no existe en el inventario', () => {
      const unknownFood: InventoryItem = {
        id: 'food-pizza',
        name: 'Pizza',
        category: 'food',
        quantity: 1,
      };

      const { updatedPet, updatedInventory } = feedPet(basePet, unknownFood, baseInventory);

      expect(updatedPet).toBe(basePet);
      expect(updatedInventory).toBe(baseInventory);
    });

    it('garantiza inmutabilidad y no muta ni el pet ni el inventario original', () => {
      expect(() => feedPet(basePet, sampleFood, baseInventory)).not.toThrow();
      expect(basePet.needs.hunger).toBe(80);
      expect(baseInventory.items[0].quantity).toBe(3);
    });
  });

  // ─── cleanPet ──────────────────────────────────────────────

  describe('cleanPet', () => {
    it('incrementa higiene con eficiencia por defecto y aporta bono de felicidad', () => {
      const dirtyPet: Pet = {
        ...basePet,
        needs: { ...basePet.needs, hygiene: 40, happiness: 60 },
      };

      const cleaned = cleanPet(dirtyPet);

      expect(cleaned.needs.hygiene).toBe(40 + DEFAULT_CLEAN_EFFICIENCY);
      expect(cleaned.needs.happiness).toBe(60 + DEFAULT_CLEAN_HAPPINESS_BOOST);
    });

    it('respeta la eficiencia de jabón personalizada', () => {
      const dirtyPet: Pet = {
        ...basePet,
        needs: { ...basePet.needs, hygiene: 20 },
      };

      const customEfficiency = 50;
      const cleaned = cleanPet(dirtyPet, customEfficiency);

      expect(cleaned.needs.hygiene).toBe(70);
    });

    it('acota la higiene y felicidad al valor máximo de 100', () => {
      const almostCleanPet: Pet = {
        ...basePet,
        needs: { ...basePet.needs, hygiene: 95, happiness: 98 },
      };

      const cleaned = cleanPet(almostCleanPet);

      expect(cleaned.needs.hygiene).toBe(100);
      expect(cleaned.needs.happiness).toBe(100);
    });

    it('no muta la mascota original', () => {
      expect(() => cleanPet(basePet)).not.toThrow();
      expect(basePet.needs.hygiene).toBe(80);
    });
  });

  // ─── petAnimal ─────────────────────────────────────────────

  describe('petAnimal', () => {
    it('incrementa la felicidad con el bono de caricia', () => {
      const sadPet: Pet = {
        ...basePet,
        needs: { ...basePet.needs, happiness: 50 },
      };

      const petted = petAnimal(sadPet);

      expect(petted.needs.happiness).toBe(50 + DEFAULT_PET_HAPPINESS_BOOST);
    });

    it('acota la felicidad al valor máximo de 100', () => {
      const happyPet: Pet = {
        ...basePet,
        needs: { ...basePet.needs, happiness: 96 },
      };

      const petted = petAnimal(happyPet);

      expect(petted.needs.happiness).toBe(100);
    });

    it('no muta la mascota original', () => {
      expect(() => petAnimal(basePet)).not.toThrow();
      expect(basePet.needs.happiness).toBe(80);
    });
  });
});
