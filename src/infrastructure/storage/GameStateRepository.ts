/**
 * Repositorio de alto nivel para el estado del juego.
 *
 * Encapsula la serialización/deserialización del GameState completo
 * y ofrece un fallback seguro a estado por defecto cuando los datos
 * no existen o están corruptos.
 */

import type { GameState } from '../../domain';
import { createDefaultGameState } from '../../domain';
import type { IStorageService } from './IStorageService';

const GAME_STATE_KEY = 'pet-society:game-state';

export class GameStateRepository {
  private readonly storage: IStorageService;

  constructor(storage: IStorageService) {
    this.storage = storage;
  }

  /**
   * Carga el estado guardado.
   * Si no hay datos o están corruptos, retorna el estado por defecto.
   */
  async loadGameState(): Promise<GameState> {
    const state = await this.storage.getItem<GameState>(GAME_STATE_KEY);

    if (state === null) {
      return createDefaultGameState();
    }

    // Validación básica de estructura: si falta algún campo clave,
    // consideramos los datos corruptos y retornamos el default.
    if (!this.isValidGameState(state)) {
      return createDefaultGameState();
    }

    return state;
  }

  /** Persiste el estado actual del juego. */
  async saveGameState(state: GameState): Promise<void> {
    await this.storage.setItem(GAME_STATE_KEY, state);
  }

  /** Resetea al estado por defecto y lo persiste. */
  async resetGameState(): Promise<GameState> {
    const defaultState = createDefaultGameState();
    await this.storage.setItem(GAME_STATE_KEY, defaultState);
    return defaultState;
  }

  /**
   * Validación de estructura del GameState.
   * Verifica que los campos principales existan y sean del tipo esperado.
   */
  private isValidGameState(state: unknown): state is GameState {
    if (typeof state !== 'object' || state === null) {
      return false;
    }

    const candidate = state as Record<string, unknown>;

    // Verificar campos de primer nivel
    if (typeof candidate.lastSavedTimestamp !== 'number') {
      return false;
    }

    // Verificar pet
    if (typeof candidate.pet !== 'object' || candidate.pet === null) {
      return false;
    }
    const pet = candidate.pet as Record<string, unknown>;
    if (typeof pet.id !== 'string' || typeof pet.name !== 'string') {
      return false;
    }

    // Verificar wallet
    if (typeof candidate.wallet !== 'object' || candidate.wallet === null) {
      return false;
    }
    const wallet = candidate.wallet as Record<string, unknown>;
    if (typeof wallet.coins !== 'number' || typeof wallet.cash !== 'number') {
      return false;
    }

    // Verificar inventory
    if (typeof candidate.inventory !== 'object' || candidate.inventory === null) {
      return false;
    }

    // Verificar room
    if (typeof candidate.room !== 'object' || candidate.room === null) {
      return false;
    }
    const room = candidate.room as Record<string, unknown>;
    if (typeof room.id !== 'string' || typeof room.name !== 'string') {
      return false;
    }

    return true;
  }
}

export { GAME_STATE_KEY };
