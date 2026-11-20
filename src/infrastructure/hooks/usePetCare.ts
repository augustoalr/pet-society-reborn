/**
 * Hook de aplicación para el ciclo de vida de la mascota y cuidados (GameLoop + Persistencia).
 *
 * Responsabilidades:
 * - Cargar el GameState inicial desde GameStateRepository (R-02: Wrappers).
 * - Calcular y aplicar el decremento acumulado offline (tiempo ausente).
 * - Gestionar el bucle periódico en primer plano (Tick de necesidades) con cálculo delta.
 * - Despachar acciones de cuidado inmutables llamando a las funciones puras del dominio (R-01, R-03).
 * - Auto-guardar periódicamente y tras cada acción de cuidado en el almacenamiento.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GameState,
  InventoryItem,
  PetAppearance,
  PetClothes,
  TransactionResult,
  PurchaseCost,
} from '../../domain';
import {
  calculateNeedsDecay,
  feedPet,
  cleanPet,
  petAnimal,
  creditCurrency,
  debitCurrency,
  canAfford,
  purchase,
} from '../../domain';
import { GameStateRepository, LocalStorageAdapter } from '../storage';

export interface UsePetCareOptions {
  /** Repositorio de persistencia a utilizar (por defecto LocalStorageAdapter). */
  readonly repository?: GameStateRepository;
  /** Intervalo en milisegundos para el tick en primer plano (por defecto 5000ms = 5s). */
  readonly tickIntervalMs?: number;
  /** Cantidad de ticks entre auto-guardados periódicos (por defecto 3 ticks = 15s). */
  readonly autoSaveIntervalTicks?: number;
}

export interface UsePetCareResult {
  readonly gameState: GameState | null;
  readonly isLoading: boolean;
  readonly offlineSecondsElapsed: number;
  readonly feedbackMessage: string | null;
  readonly feed: (foodItem: InventoryItem) => boolean;
  readonly clean: (soapEfficiency?: number) => void;
  readonly pet: () => void;
  readonly updateAppearance: (appearance: PetAppearance) => void;
  readonly updateClothes: (clothes: PetClothes) => void;
  readonly resetGame: () => Promise<void>;
  readonly saveNow: () => Promise<void>;
  readonly addCoins: (amount: number, description?: string) => TransactionResult;
  readonly spendCoins: (amount: number, description?: string) => TransactionResult;
  readonly addCash: (amount: number, description?: string) => TransactionResult;
  readonly spendCash: (amount: number, description?: string) => TransactionResult;
  readonly canAfford: (cost: PurchaseCost) => boolean;
  readonly purchase: (cost: PurchaseCost, description?: string) => TransactionResult;
}

// Repositorio por defecto como singleton en runtime
const defaultRepository = new GameStateRepository(new LocalStorageAdapter());

export function usePetCare(options: UsePetCareOptions = {}): UsePetCareResult {
  const {
    repository = defaultRepository,
    tickIntervalMs = 5000,
    autoSaveIntervalTicks = 3,
  } = options;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineSecondsElapsed, setOfflineSecondsElapsed] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const lastTickTimestampRef = useRef<number>(0);
  const ticksSinceLastSaveRef = useRef<number>(0);
  const latestStateRef = useRef<GameState | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Mantener latestStateRef sincronizado
  useEffect(() => {
    latestStateRef.current = gameState;
  }, [gameState]);

  // Mensaje de feedback temporal para la UI
  const triggerFeedback = useCallback((message: string) => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedbackMessage(message);
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedbackMessage(null);
      feedbackTimeoutRef.current = null;
    }, 2500);
  }, []);

  // 1. Carga inicial del estado y cálculo de decremento offline
  useEffect(() => {
    let isCancelled = false;

    const loadInitialState = async () => {
      try {
        const loaded = await repository.loadGameState();
        if (isCancelled) return;

        const now = Date.now();
        const elapsedOffline = Math.max(0, (now - loaded.lastSavedTimestamp) / 1000);
        setOfflineSecondsElapsed(elapsedOffline);

        if (elapsedOffline > 0) {
          const updatedNeeds = calculateNeedsDecay(loaded.pet.needs, elapsedOffline);
          const stateWithOfflineDecay: GameState = {
            ...loaded,
            pet: {
              ...loaded.pet,
              needs: updatedNeeds,
            },
            lastSavedTimestamp: now,
          };

          await repository.saveGameState(stateWithOfflineDecay);
          if (isCancelled) return;

          setGameState(stateWithOfflineDecay);
          lastTickTimestampRef.current = now;
        } else {
          setGameState(loaded);
          lastTickTimestampRef.current = now;
        }
      } catch {
        // En caso de fallo inesperado, se delega al repositorio el fallback seguro
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadInitialState();

    return () => {
      isCancelled = true;
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [repository]);

  // 2. Temporizador en primer plano (Tick periódico) con auto-guardado gradual
  useEffect(() => {
    if (isLoading) {
      return;
    }

    lastTickTimestampRef.current = Date.now();

    const intervalId = window.setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastTickTimestampRef.current) / 1000;
      lastTickTimestampRef.current = now;

      if (elapsedSeconds <= 0) {
        return;
      }

      setGameState((prev) => {
        if (!prev) return prev;

        const newNeeds = calculateNeedsDecay(prev.pet.needs, elapsedSeconds);
        const nextState: GameState = {
          ...prev,
          pet: {
            ...prev.pet,
            needs: newNeeds,
          },
          lastSavedTimestamp: now,
        };

        ticksSinceLastSaveRef.current += 1;
        if (ticksSinceLastSaveRef.current >= autoSaveIntervalTicks) {
          ticksSinceLastSaveRef.current = 0;
          repository.saveGameState(nextState).catch(() => {});
        }

        return nextState;
      });
    }, tickIntervalMs);

    // Detección de cambio de visibilidad de pestaña (reanudación / salida)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const elapsed = (now - lastTickTimestampRef.current) / 1000;
        lastTickTimestampRef.current = now;

        if (elapsed > 0) {
          setGameState((prev) => {
            if (!prev) return prev;
            const newNeeds = calculateNeedsDecay(prev.pet.needs, elapsed);
            const nextState: GameState = {
              ...prev,
              pet: { ...prev.pet, needs: newNeeds },
              lastSavedTimestamp: now,
            };
            repository.saveGameState(nextState).catch(() => {});
            return nextState;
          });
        }
      } else if (document.visibilityState === 'hidden') {
        if (latestStateRef.current) {
          repository.saveGameState(latestStateRef.current).catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (latestStateRef.current) {
        repository.saveGameState(latestStateRef.current).catch(() => {});
      }
    };
  }, [isLoading, tickIntervalMs, autoSaveIntervalTicks, repository]);

  // 3. Acción: Alimentar a la mascota
  const feed = useCallback(
    (foodItem: InventoryItem): boolean => {
      if (!latestStateRef.current) return false;

      const current = latestStateRef.current;
      const { updatedPet, updatedInventory } = feedPet(
        current.pet,
        foodItem,
        current.inventory
      );

      // Si no hubo cambio (ej. no era comida o no había cantidad)
      if (
        updatedPet === current.pet &&
        updatedInventory === current.inventory
      ) {
        return false;
      }

      const hungerGained = Math.round(updatedPet.needs.hunger - current.pet.needs.hunger);
      const nextState: GameState = {
        ...current,
        pet: updatedPet,
        inventory: updatedInventory,
        lastSavedTimestamp: Date.now(),
      };

      setGameState(nextState);
      repository.saveGameState(nextState).catch(() => {});
      triggerFeedback(`¡Ñam! ${updatedPet.name} comió ${foodItem.name} (+${hungerGained} hambre)`);
      return true;
    },
    [repository, triggerFeedback]
  );

  // 4. Acción: Bañar / Limpiar con jabón
  const clean = useCallback(
    (soapEfficiency?: number) => {
      if (!latestStateRef.current) return;

      const current = latestStateRef.current;
      const updatedPet = cleanPet(current.pet, soapEfficiency);

      if (updatedPet.needs.hygiene === current.pet.needs.hygiene) {
        triggerFeedback(`¡${updatedPet.name} ya está completamente limpio! ✨`);
        return;
      }

      const hygieneGained = Math.round(updatedPet.needs.hygiene - current.pet.needs.hygiene);
      const nextState: GameState = {
        ...current,
        pet: updatedPet,
        lastSavedTimestamp: Date.now(),
      };

      setGameState(nextState);
      repository.saveGameState(nextState).catch(() => {});
      triggerFeedback(`¡Frotando con jabón! (+${hygieneGained} higiene, +5 felicidad) 🧼`);
    },
    [repository, triggerFeedback]
  );

  // 5. Acción: Acariciar a la mascota
  const pet = useCallback(() => {
    if (!latestStateRef.current) return;

    const current = latestStateRef.current;
    const updatedPet = petAnimal(current.pet);

    const happinessGained = Math.round(updatedPet.needs.happiness - current.pet.needs.happiness);
    const nextState: GameState = {
      ...current,
      pet: updatedPet,
      lastSavedTimestamp: Date.now(),
    };

    setGameState(nextState);
    repository.saveGameState(nextState).catch(() => {});

    if (happinessGained > 0) {
      triggerFeedback(`¡Acariciando a ${updatedPet.name}! (+${happinessGained} felicidad) ❤️`);
    } else {
      triggerFeedback(`¡${updatedPet.name} ya está al máximo de felicidad! ❤️`);
    }
  }, [repository, triggerFeedback]);

  // 6. Actualización de apariencia inmutable
  const updateAppearance = useCallback(
    (appearance: PetAppearance) => {
      if (!latestStateRef.current) return;

      const nextState: GameState = {
        ...latestStateRef.current,
        pet: {
          ...latestStateRef.current.pet,
          appearance,
        },
        lastSavedTimestamp: Date.now(),
      };

      setGameState(nextState);
      repository.saveGameState(nextState).catch(() => {});
    },
    [repository]
  );

  // 7. Actualización de ropa inmutable
  const updateClothes = useCallback(
    (clothes: PetClothes) => {
      if (!latestStateRef.current) return;

      const nextState: GameState = {
        ...latestStateRef.current,
        pet: {
          ...latestStateRef.current.pet,
          clothes,
        },
        lastSavedTimestamp: Date.now(),
      };

      setGameState(nextState);
      repository.saveGameState(nextState).catch(() => {});
    },
    [repository]
  );

  // 8. Reseteo completo a valores por defecto
  const resetGame = useCallback(async () => {
    const defaultState = await repository.resetGameState();
    setGameState(defaultState);
    lastTickTimestampRef.current = Date.now();
    triggerFeedback('Partida restablecida a valores iniciales');
  }, [repository, triggerFeedback]);

  // 9. Forzar guardado inmediato
  const saveNow = useCallback(async () => {
    if (latestStateRef.current) {
      await repository.saveGameState(latestStateRef.current);
    }
  }, [repository]);

  // 10. Operaciones de economía inmutables y sincronizadas con persistencia (T-06)
  const addCoins = useCallback(
    (amount: number, description?: string): TransactionResult => {
      if (!latestStateRef.current) {
        return {
          success: false,
          wallet: { coins: 0, cash: 0 },
          error: 'INVALID_AMOUNT',
        };
      }

      const current = latestStateRef.current;
      const result = creditCurrency(current.wallet, 'coins', amount, description);

      if (result.success) {
        const nextState: GameState = {
          ...current,
          wallet: result.wallet,
          lastSavedTimestamp: Date.now(),
        };
        latestStateRef.current = nextState;
        setGameState(nextState);
        repository.saveGameState(nextState).catch(() => {});
      }

      return result;
    },
    [repository]
  );

  const spendCoins = useCallback(
    (amount: number, description?: string): TransactionResult => {
      if (!latestStateRef.current) {
        return {
          success: false,
          wallet: { coins: 0, cash: 0 },
          error: 'INSUFFICIENT_FUNDS',
        };
      }

      const current = latestStateRef.current;
      const result = debitCurrency(current.wallet, 'coins', amount, description);

      if (result.success) {
        const nextState: GameState = {
          ...current,
          wallet: result.wallet,
          lastSavedTimestamp: Date.now(),
        };
        latestStateRef.current = nextState;
        setGameState(nextState);
        repository.saveGameState(nextState).catch(() => {});
      }

      return result;
    },
    [repository]
  );

  const addCash = useCallback(
    (amount: number, description?: string): TransactionResult => {
      if (!latestStateRef.current) {
        return {
          success: false,
          wallet: { coins: 0, cash: 0 },
          error: 'INVALID_AMOUNT',
        };
      }

      const current = latestStateRef.current;
      const result = creditCurrency(current.wallet, 'cash', amount, description);

      if (result.success) {
        const nextState: GameState = {
          ...current,
          wallet: result.wallet,
          lastSavedTimestamp: Date.now(),
        };
        latestStateRef.current = nextState;
        setGameState(nextState);
        repository.saveGameState(nextState).catch(() => {});
      }

      return result;
    },
    [repository]
  );

  const spendCash = useCallback(
    (amount: number, description?: string): TransactionResult => {
      if (!latestStateRef.current) {
        return {
          success: false,
          wallet: { coins: 0, cash: 0 },
          error: 'INSUFFICIENT_FUNDS',
        };
      }

      const current = latestStateRef.current;
      const result = debitCurrency(current.wallet, 'cash', amount, description);

      if (result.success) {
        const nextState: GameState = {
          ...current,
          wallet: result.wallet,
          lastSavedTimestamp: Date.now(),
        };
        latestStateRef.current = nextState;
        setGameState(nextState);
        repository.saveGameState(nextState).catch(() => {});
      }

      return result;
    },
    [repository]
  );

  const checkCanAfford = useCallback(
    (cost: PurchaseCost): boolean => {
      if (!latestStateRef.current) {
        return false;
      }
      return canAfford(latestStateRef.current.wallet, cost);
    },
    []
  );

  const executePurchase = useCallback(
    (cost: PurchaseCost, description?: string): TransactionResult => {
      if (!latestStateRef.current) {
        return {
          success: false,
          wallet: { coins: 0, cash: 0 },
          error: 'INSUFFICIENT_FUNDS',
        };
      }

      const current = latestStateRef.current;
      const result = purchase(current.wallet, cost, description);

      if (result.success && result.wallet !== current.wallet) {
        const nextState: GameState = {
          ...current,
          wallet: result.wallet,
          lastSavedTimestamp: Date.now(),
        };
        latestStateRef.current = nextState;
        setGameState(nextState);
        repository.saveGameState(nextState).catch(() => {});
      }

      return result;
    },
    [repository]
  );

  return {
    gameState,
    isLoading,
    offlineSecondsElapsed,
    feedbackMessage,
    feed,
    clean,
    pet,
    updateAppearance,
    updateClothes,
    resetGame,
    saveNow,
    addCoins,
    spendCoins,
    addCash,
    spendCash,
    canAfford: checkCanAfford,
    purchase: executePurchase,
  };
}
