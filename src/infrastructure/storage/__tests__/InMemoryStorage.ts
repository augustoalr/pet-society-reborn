/**
 * Mock in-memory de la interfaz Web Storage API.
 *
 * Permite testear LocalStorageAdapter en Node.js sin `window`.
 * Simula también errores de quota cuando se configura `throwOnSet`.
 */

export class InMemoryStorage implements Storage {
  private store = new Map<string, string>();
  private _throwOnSet = false;

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this._throwOnSet) {
      throw new DOMException(
        'Failed to execute \'setItem\' on \'Storage\': Setting the value exceeded the quota.',
        'QuotaExceededError',
      );
    }
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  /** Habilita la simulación de QuotaExceededError en setItem. */
  set throwOnSet(value: boolean) {
    this._throwOnSet = value;
  }
}
