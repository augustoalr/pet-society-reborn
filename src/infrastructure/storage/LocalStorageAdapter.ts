/**
 * Adaptador de IStorageService que utiliza la Web Storage API (localStorage).
 *
 * Acepta un objeto `Storage` inyectable por constructor para poder
 * testearlo en Node.js sin depender de `window.localStorage`.
 *
 * Maneja errores de forma segura:
 * - JSON corrupto en getItem → retorna null en vez de lanzar.
 * - QuotaExceededError en setItem → propaga el error (la capa superior decide).
 */

import type { IStorageService } from './IStorageService';

export class LocalStorageAdapter implements IStorageService {
  private readonly storage: Storage;

  constructor(storage?: Storage) {
    // Si no se inyecta, usa el localStorage global del navegador.
    // En tests se inyecta un mock in-memory.
    this.storage = storage ?? globalThis.localStorage;
  }

  async getItem<T>(key: string): Promise<T | null> {
    const raw = this.storage.getItem(key);

    if (raw === null) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      // JSON corrupto: tratamos como si no existiera.
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    this.storage.setItem(key, serialized);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}
