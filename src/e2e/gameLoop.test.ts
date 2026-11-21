/**
 * Suite E2E / Smoke Test de Integración del Bucle Completo de Pet Society (T-10).
 *
 * Valida de punta a punta el ciclo vital completo del MVP:
 * 1. Mascota inicial creada con necesidades base.
 * 2. Cuidado de la mascota (bajar hambre, subir higiene y felicidad).
 * 3. Jugar al minijuego de la pelota en el jardín y acreditar recompensa monetaria.
 * 4. Comprar un mueble en la tienda con las monedas ganadas.
 * 5. Colocar el mueble en la habitación en coordenadas válidas.
 * 6. Simular recarga de página leyendo del repositorio de persistencia y confirmar
 *    que todas las monedas, muebles colocados, inventario y necesidades permanecen intactos.
 */

import { describe, it, expect, vi } from 'vitest';
import type { GameState } from '../domain';
import {
  calculateNeedsDecay,
  feedPet,
  cleanPet,
  petAnimal,
  clampNeed,
  creditCurrency,
  createInitialBallGameState,
  startBallGame,
  hitBall,
  calculateMinigameReward,
  getShopItemById,
  canAffordShopItem,
  processPurchase,
  placeFurnitureFromInventory,
  isWithinBounds,
  DEFAULT_ROOM_BOUNDS,
} from '../domain';
import { GameStateRepository, LocalStorageAdapter } from '../infrastructure/storage';
import { InMemoryStorage } from '../infrastructure/storage/__tests__/InMemoryStorage';
import { SoundEffectsService } from '../infrastructure/audio';

describe('E2E: Bucle de Juego Completo del MVP (Game Loop)', () => {
  it('ejecuta el ciclo de vida completo: inicio -> cuidado -> minijuego -> compra -> decoración -> persistencia y recarga', async () => {
    // Preparación del entorno de persistencia simulado
    const storage = new InMemoryStorage();
    const adapter = new LocalStorageAdapter(storage);
    const repository = new GameStateRepository(adapter);

    // Preparación del servicio de audio agnóstico
    const soundService = new SoundEffectsService({ audioContext: null, storage });
    const playSpy = vi.spyOn(soundService, 'play');

    // =========================================================================
    // 1. Mascota inicial creada con necesidades base
    // =========================================================================
    const initialGameState = await repository.loadGameState();

    expect(initialGameState).toBeDefined();
    expect(initialGameState.pet.name).toBe('Mi Mascota');
    expect(initialGameState.pet.level).toBe(1);
    expect(initialGameState.pet.needs.hunger).toBe(80);
    expect(initialGameState.pet.needs.hygiene).toBe(80);
    expect(initialGameState.pet.needs.happiness).toBe(100);
    expect(initialGameState.pet.needs.energy).toBe(100);
    expect(initialGameState.wallet.coins).toBe(100);
    expect(initialGameState.wallet.cash).toBe(0);
    expect(initialGameState.room.placedItems).toHaveLength(0);

    const initialApple = initialGameState.inventory.items.find(
      (item) => item.id === 'food-apple'
    );
    expect(initialApple).toBeDefined();
    expect(initialApple?.quantity).toBe(3);

    // =========================================================================
    // 2. Cuidado de la mascota (bajar hambre, subir higiene y felicidad)
    // =========================================================================
    // 2a. Simulación de decremento por tiempo ausente (e.g. 1 hora = 3600 segundos)
    const decayedNeeds = calculateNeedsDecay(initialGameState.pet.needs, 3600);
    expect(decayedNeeds.hunger).toBeLessThan(80);
    expect(decayedNeeds.hygiene).toBeLessThan(80);
    expect(decayedNeeds.happiness).toBeLessThan(100);

    let currentState: GameState = {
      ...initialGameState,
      pet: {
        ...initialGameState.pet,
        needs: decayedNeeds,
      },
      lastSavedTimestamp: Date.now(),
    };
    await repository.saveGameState(currentState);

    const hungerBeforeFeed = currentState.pet.needs.hunger;
    const hygieneBeforeClean = currentState.pet.needs.hygiene;

    // 2b. Alimentar mascota con una manzana del inventario
    const appleToFeed = currentState.inventory.items.find(
      (item) => item.id === 'food-apple'
    )!;
    const feedResult = feedPet(currentState.pet, appleToFeed, currentState.inventory);
    soundService.playFeed();
    expect(playSpy).toHaveBeenCalledWith('feed');

    expect(feedResult.updatedPet.needs.hunger).toBeGreaterThan(hungerBeforeFeed);

    currentState = {
      ...currentState,
      pet: feedResult.updatedPet,
      inventory: feedResult.updatedInventory,
    };
    await repository.saveGameState(currentState);

    const remainingApples = currentState.inventory.items.find(
      (item) => item.id === 'food-apple'
    );
    expect(remainingApples?.quantity).toBe(2);

    // 2c. Limpiar a la mascota con jabón
    const cleanedPet = cleanPet(currentState.pet, 30);
    soundService.playClean();
    expect(playSpy).toHaveBeenCalledWith('clean');

    expect(cleanedPet.needs.hygiene).toBeGreaterThan(hygieneBeforeClean);

    // 2d. Acariciar a la mascota
    const happinessBeforePet = cleanedPet.needs.happiness;
    const pettedPet = petAnimal(cleanedPet);
    soundService.playPet();
    expect(playSpy).toHaveBeenCalledWith('pet');

    expect(pettedPet.needs.happiness).toBeGreaterThan(happinessBeforePet);

    currentState = {
      ...currentState,
      pet: pettedPet,
    };
    await repository.saveGameState(currentState);

    // =========================================================================
    // 3. Jugar al minijuego de la pelota y acreditar recompensa monetaria
    // =========================================================================
    const coinsBeforeMinigame = currentState.wallet.coins;

    let minigame = createInitialBallGameState(undefined, 0);
    minigame = startBallGame(minigame);
    expect(minigame.status).toBe('playing');

    // Realizar 5 toques consecutivos de pelota con combo incremental
    for (let i = 0; i < 5; i++) {
      const clickPos = { x: minigame.ball.x, y: minigame.ball.y };
      minigame = hitBall(minigame, clickPos);
      soundService.playBallHit();
    }

    expect(minigame.combo).toBe(5);
    expect(minigame.score).toBeGreaterThan(0);
    expect(playSpy).toHaveBeenCalledWith('ballHit');

    // Fin de partida y cálculo de recompensa
    soundService.playGameOver();
    expect(playSpy).toHaveBeenCalledWith('gameOver');

    const reward = calculateMinigameReward(minigame.score);
    expect(reward.coins).toBeGreaterThan(0);
    expect(reward.happiness).toBeGreaterThan(0);

    // Acreditar monedas a la billetera y elevar felicidad
    const creditResult = creditCurrency(
      currentState.wallet,
      'coins',
      reward.coins,
      'Recompensa de minijuego'
    );
    expect(creditResult.success).toBe(true);

    const boostedHappiness = clampNeed(
      currentState.pet.needs.happiness + reward.happiness
    );

    currentState = {
      ...currentState,
      wallet: creditResult.wallet,
      pet: {
        ...currentState.pet,
        needs: {
          ...currentState.pet.needs,
          happiness: boostedHappiness,
        },
      },
    };
    await repository.saveGameState(currentState);

    expect(currentState.wallet.coins).toBe(
      coinsBeforeMinigame + reward.coins
    );

    // =========================================================================
    // 4. Comprar un mueble en la tienda con las monedas ganadas
    // =========================================================================
    // Seleccionar la Mesa de Madera (costo: 50 monedas)
    const tableItem = getShopItemById('furniture-table');
    expect(tableItem).toBeDefined();
    expect(tableItem?.price.coins).toBe(50);

    const coinsBeforePurchase = currentState.wallet.coins;
    expect(canAffordShopItem(currentState.wallet, tableItem!, 1)).toBe(true);

    const purchaseResult = processPurchase(
      currentState.wallet,
      currentState.inventory,
      'furniture-table',
      1
    );
    expect(purchaseResult.success).toBe(true);
    soundService.playBuy();
    expect(playSpy).toHaveBeenCalledWith('buy');

    currentState = {
      ...currentState,
      wallet: purchaseResult.updatedWallet,
      inventory: purchaseResult.updatedInventory,
    };
    await repository.saveGameState(currentState);

    expect(currentState.wallet.coins).toBe(coinsBeforePurchase - 50);

    const inventoryTable = currentState.inventory.items.find(
      (item) => item.id === 'furniture-table'
    );
    // Tenía 1 inicial + 1 comprada = 2 mesas
    expect(inventoryTable?.quantity).toBe(2);

    // =========================================================================
    // 5. Colocar el mueble en la habitación
    // =========================================================================
    const furniturePlacementPos = { x: 380, y: 400 };
    const placementResult = placeFurnitureFromInventory(
      currentState.room,
      currentState.inventory,
      'furniture-table',
      furniturePlacementPos
    );

    expect(placementResult.success).toBe(true);
    const placedTable = placementResult.room.placedItems.find(
      (item) => item.itemId === 'furniture-table'
    );
    expect(placedTable).toBeDefined();
    expect(placedTable?.itemId).toBe('furniture-table');
    expect(placedTable?.x).toBe(furniturePlacementPos.x);
    expect(placedTable?.y).toBe(furniturePlacementPos.y);

    currentState = {
      ...currentState,
      room: placementResult.room,
      inventory: placementResult.inventory,
    };
    await repository.saveGameState(currentState);

    // El inventario de mesas debe decrementar a 1 tras colocarla en la sala
    const inventoryTableAfterPlacement = currentState.inventory.items.find(
      (item) => item.id === 'furniture-table'
    );
    expect(inventoryTableAfterPlacement?.quantity).toBe(1);
    expect(currentState.room.placedItems).toHaveLength(1);

    // =========================================================================
    // 6. Simular recarga de página leyendo del repositorio de persistencia
    // =========================================================================
    // Instanciamos un nuevo repositorio conectado al mismo almacenamiento subyacente
    const freshRepository = new GameStateRepository(adapter);
    const reloadedState = await freshRepository.loadGameState();

    // Verificaciones exhaustivas de integridad de datos
    expect(reloadedState.pet.name).toBe('Mi Mascota');
    expect(reloadedState.pet.needs.hunger).toBe(currentState.pet.needs.hunger);
    expect(reloadedState.pet.needs.hygiene).toBe(currentState.pet.needs.hygiene);
    expect(reloadedState.pet.needs.happiness).toBe(currentState.pet.needs.happiness);

    // Saldo económico exacto
    expect(reloadedState.wallet.coins).toBe(coinsBeforePurchase - 50);
    expect(reloadedState.wallet.cash).toBe(0);

    // Inventario consistente: 2 manzanas restantes, 1 mesa disponible
    const reloadedApples = reloadedState.inventory.items.find(
      (item) => item.id === 'food-apple'
    );
    expect(reloadedApples?.quantity).toBe(2);

    const reloadedTableInventory = reloadedState.inventory.items.find(
      (item) => item.id === 'furniture-table'
    );
    expect(reloadedTableInventory?.quantity).toBe(1);

    // Habitación decorada intacta con el mueble colocado en sus coordenadas exactas
    expect(reloadedState.room.placedItems).toHaveLength(1);
    expect(reloadedState.room.placedItems[0].itemId).toBe('furniture-table');
    expect(reloadedState.room.placedItems[0].x).toBe(furniturePlacementPos.x);
    expect(reloadedState.room.placedItems[0].y).toBe(furniturePlacementPos.y);

    // Integridad total del GameState recuperado tras recarga
    expect(reloadedState).toEqual(currentState);
  });

  it('valida robustez ante intentos inválidos de compra o colocación fuera de límites', async () => {
    const storage = new InMemoryStorage();
    const adapter = new LocalStorageAdapter(storage);
    const repository = new GameStateRepository(adapter);

    const state = await repository.loadGameState();

    // 1. Intento de compra con saldo insuficiente en Cash
    const expensiveCrown = getShopItemById('crown')!; // Cuesta 5 Cash, el jugador tiene 0
    expect(canAffordShopItem(state.wallet, expensiveCrown, 1)).toBe(false);

    const failedPurchase = processPurchase(
      state.wallet,
      state.inventory,
      'crown',
      1
    );
    expect(failedPurchase.success).toBe(false);
    expect(failedPurchase.error).toBeDefined();

    // 2. Coordenadas fuera de límites son detectadas por isWithinBounds y acotadas defensivamente
    const outOfBoundsTarget = { x: DEFAULT_ROOM_BOUNDS.minX - 100, y: 300 };
    expect(isWithinBounds(outOfBoundsTarget, DEFAULT_ROOM_BOUNDS)).toBe(false);

    const clampedPlacement = placeFurnitureFromInventory(
      state.room,
      state.inventory,
      'furniture-bed',
      outOfBoundsTarget
    );
    expect(clampedPlacement.success).toBe(true);
    const placedBed = clampedPlacement.room.placedItems.find((i) => i.itemId === 'furniture-bed');
    expect(placedBed).toBeDefined();
    expect(placedBed?.x).toBe(DEFAULT_ROOM_BOUNDS.minX);

    // 3. Intento de colocación de un ítem inexistente en el inventario retorna failure
    const nonExistentPlacement = placeFurnitureFromInventory(
      state.room,
      state.inventory,
      'furniture-non-existent',
      { x: 400, y: 300 }
    );
    expect(nonExistentPlacement.success).toBe(false);
  });
});
