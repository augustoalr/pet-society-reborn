import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateRepository, GAME_STATE_KEY } from '../GameStateRepository';
import { LocalStorageAdapter } from '../LocalStorageAdapter';
import { InMemoryStorage } from './InMemoryStorage';
import { createDefaultGameState } from '../../../domain';
import type { GameState } from '../../../domain';

describe('GameStateRepository', () => {
  let storage: InMemoryStorage;
  let adapter: LocalStorageAdapter;
  let repo: GameStateRepository;

  beforeEach(() => {
    storage = new InMemoryStorage();
    adapter = new LocalStorageAdapter(storage);
    repo = new GameStateRepository(adapter);
  });

  // ─── loadGameState ─────────────────────────────────────────

  describe('loadGameState', () => {
    it('retorna estado por defecto cuando no hay datos guardados', async () => {
      const state = await repo.loadGameState();
      const defaults = createDefaultGameState();

      // Comparamos excluyendo lastSavedTimestamp (es Date.now())
      expect(state.pet).toEqual(defaults.pet);
      expect(state.wallet).toEqual(defaults.wallet);
      expect(state.inventory).toEqual(defaults.inventory);
      expect(state.room).toEqual(defaults.room);
      expect(typeof state.lastSavedTimestamp).toBe('number');
    });

    it('recupera un estado previamente guardado', async () => {
      const original = createDefaultGameState();
      const modified: GameState = {
        ...original,
        pet: { ...original.pet, name: 'Luna' },
        wallet: { coins: 500, cash: 10 },
        lastSavedTimestamp: 1700000000000,
      };

      await repo.saveGameState(modified);
      const loaded = await repo.loadGameState();

      expect(loaded.pet.name).toBe('Luna');
      expect(loaded.wallet.coins).toBe(500);
      expect(loaded.wallet.cash).toBe(10);
      expect(loaded.lastSavedTimestamp).toBe(1700000000000);
    });

    it('retorna estado por defecto cuando el JSON está corrupto', async () => {
      // Inyectamos basura directamente
      storage.setItem(GAME_STATE_KEY, '{corrupto!!!');

      const state = await repo.loadGameState();
      const defaults = createDefaultGameState();

      expect(state.pet).toEqual(defaults.pet);
      expect(state.wallet).toEqual(defaults.wallet);
    });

    it('retorna estado por defecto cuando los datos tienen estructura incompleta', async () => {
      // Guardamos un objeto parcial que pasa JSON.parse pero no la validación
      storage.setItem(
        GAME_STATE_KEY,
        JSON.stringify({ pet: { id: 'x' } }),
      );

      const state = await repo.loadGameState();
      const defaults = createDefaultGameState();

      expect(state.pet).toEqual(defaults.pet);
    });

    it('retorna estado por defecto cuando falta el campo wallet', async () => {
      storage.setItem(
        GAME_STATE_KEY,
        JSON.stringify({
          pet: { id: 'x', name: 'Test' },
          inventory: { items: [] },
          room: { id: 'r', name: 'Room' },
          lastSavedTimestamp: 123,
          // wallet falta
        }),
      );

      const state = await repo.loadGameState();
      const defaults = createDefaultGameState();
      expect(state.wallet).toEqual(defaults.wallet);
    });

    it('retorna estado por defecto cuando falta el campo room', async () => {
      storage.setItem(
        GAME_STATE_KEY,
        JSON.stringify({
          pet: { id: 'x', name: 'Test' },
          wallet: { coins: 0, cash: 0 },
          inventory: { items: [] },
          lastSavedTimestamp: 123,
          // room falta
        }),
      );

      const state = await repo.loadGameState();
      const defaults = createDefaultGameState();
      expect(state.room).toEqual(defaults.room);
    });

    it('retorna estado por defecto cuando lastSavedTimestamp no es un número', async () => {
      storage.setItem(
        GAME_STATE_KEY,
        JSON.stringify({
          pet: { id: 'x', name: 'Test' },
          wallet: { coins: 0, cash: 0 },
          inventory: { items: [] },
          room: { id: 'r', name: 'Room' },
          lastSavedTimestamp: 'no-es-numero',
        }),
      );

      const state = await repo.loadGameState();
      expect(typeof state.lastSavedTimestamp).toBe('number');
    });
  });

  // ─── saveGameState ─────────────────────────────────────────

  describe('saveGameState', () => {
    it('persiste el estado y lo recupera idéntico', async () => {
      const state: GameState = {
        ...createDefaultGameState(),
        lastSavedTimestamp: 999999,
      };

      await repo.saveGameState(state);
      const loaded = await repo.loadGameState();

      expect(loaded).toEqual(state);
    });

    it('no muta el objeto original al guardar', async () => {
      const original = createDefaultGameState();
      const frozen = Object.freeze({ ...original });

      // Si se intentara mutar, Object.freeze lanzaría
      await expect(repo.saveGameState(frozen)).resolves.toBeUndefined();
    });
  });

  // ─── resetGameState ────────────────────────────────────────

  describe('resetGameState', () => {
    it('borra el estado existente y retorna el estado por defecto', async () => {
      // Guardamos un estado modificado
      const modified: GameState = {
        ...createDefaultGameState(),
        wallet: { coins: 9999, cash: 100 },
      };
      await repo.saveGameState(modified);

      // Reseteamos
      const resetState = await repo.resetGameState();
      const defaults = createDefaultGameState();

      expect(resetState.wallet).toEqual(defaults.wallet);

      // Verificamos que el storage también refleja el reset
      const reloaded = await repo.loadGameState();
      expect(reloaded.wallet).toEqual(defaults.wallet);
    });

    it('funciona incluso si no había estado previo', async () => {
      const resetState = await repo.resetGameState();
      expect(resetState.pet.id).toBe('default-pet');
    });
  });
});
