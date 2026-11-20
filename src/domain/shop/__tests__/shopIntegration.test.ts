import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultGameState,
  processPurchase,
  feedPet,
  placeFurnitureFromInventory,
  DEFAULT_ROOM_BOUNDS,
} from '../../index';
import type { GameState } from '../../index';
import { GameStateRepository } from '../../../infrastructure/storage/GameStateRepository';
import { LocalStorageAdapter } from '../../../infrastructure/storage/LocalStorageAdapter';
import { InMemoryStorage } from '../../../infrastructure/storage/__tests__/InMemoryStorage';

describe('Integración Tienda con Economía, Inventario, Habitación y Cuidados (T-08)', () => {
  let storage: InMemoryStorage;
  let adapter: LocalStorageAdapter;
  let repo: GameStateRepository;
  let gameState: GameState;

  beforeEach(() => {
    storage = new InMemoryStorage();
    adapter = new LocalStorageAdapter(storage);
    repo = new GameStateRepository(adapter);
    gameState = createDefaultGameState();
  });

  it('permite comprar comida en la tienda y luego alimentar a la mascota con ella', () => {
    // 1. Estado inicial
    expect(gameState.wallet.coins).toBe(100);
    const initialCookie = gameState.inventory.items.find((i) => i.id === 'food-cookie');
    expect(initialCookie).toBeUndefined();

    // 2. Comprar 2 galletas (cada una cuesta 8 monedas y da +15 nutrición)
    const purchaseResult = processPurchase(
      gameState.wallet,
      gameState.inventory,
      'food-cookie',
      2
    );

    expect(purchaseResult.success).toBe(true);
    expect(purchaseResult.updatedWallet.coins).toBe(84); // 100 - 16

    const cookieItem = purchaseResult.updatedInventory.items.find((i) => i.id === 'food-cookie');
    expect(cookieItem).toBeDefined();
    expect(cookieItem?.quantity).toBe(2);
    expect(cookieItem?.nutrition).toBe(15);

    gameState = {
      ...gameState,
      wallet: purchaseResult.updatedWallet,
      inventory: purchaseResult.updatedInventory,
    };

    // 3. Alimentar a la mascota con una de las galletas compradas
    const hungerBefore = gameState.pet.needs.hunger;
    const { updatedPet, updatedInventory } = feedPet(
      gameState.pet,
      cookieItem!,
      gameState.inventory
    );

    expect(updatedPet.needs.hunger).toBe(Math.min(100, hungerBefore + 15));
    const remainingCookie = updatedInventory.items.find((i) => i.id === 'food-cookie');
    expect(remainingCookie?.quantity).toBe(1);
  });

  it('permite comprar muebles en la tienda y luego colocarlos en la habitación', () => {
    // 1. Dar saldo suficiente para comprar un mueble
    const richWallet = { ...gameState.wallet, coins: 200 };
    gameState = { ...gameState, wallet: richWallet };

    // 2. Comprar una mesa de madera (50 monedas)
    const buyResult = processPurchase(
      gameState.wallet,
      gameState.inventory,
      'furniture-table',
      1
    );

    expect(buyResult.success).toBe(true);
    expect(buyResult.updatedWallet.coins).toBe(150);

    gameState = {
      ...gameState,
      wallet: buyResult.updatedWallet,
      inventory: buyResult.updatedInventory,
    };

    // 3. Colocar el mueble en la habitación usando roomLogic
    const placeResult = placeFurnitureFromInventory(
      gameState.room,
      gameState.inventory,
      'furniture-table',
      { x: 300, y: 400 },
      DEFAULT_ROOM_BOUNDS
    );

    expect(placeResult.success).toBe(true);
    expect(placeResult.room.placedItems.some((i) => i.itemId === 'furniture-table')).toBe(true);
  });

  it('persiste de manera atómica el estado tras una compra en GameStateRepository', async () => {
    // 1. Comprar sushi variado (30 monedas)
    const purchaseResult = processPurchase(
      gameState.wallet,
      gameState.inventory,
      'food-sushi',
      1
    );

    expect(purchaseResult.success).toBe(true);

    const savedState: GameState = {
      ...gameState,
      wallet: purchaseResult.updatedWallet,
      inventory: purchaseResult.updatedInventory,
      lastSavedTimestamp: Date.now(),
    };

    // 2. Guardar en el repositorio
    await repo.saveGameState(savedState);

    // 3. Cargar desde el repositorio
    const loadedState = await repo.loadGameState();

    expect(loadedState.wallet.coins).toBe(70); // 100 - 30
    const loadedSushi = loadedState.inventory.items.find((i) => i.id === 'food-sushi');
    expect(loadedSushi).toBeDefined();
    expect(loadedSushi?.quantity).toBe(1);
    expect(loadedSushi?.nutrition).toBe(50);
  });
});
