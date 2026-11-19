/**
 * Contrato agnóstico de almacenamiento clave-valor.
 *
 * Cualquier adaptador (LocalStorage, Supabase, IndexedDB…) implementa
 * esta interfaz. El resto de la aplicación solo conoce IStorageService,
 * nunca el adaptador concreto → si mañana cambiamos el backend de
 * persistencia, solo se toca el adaptador, no la lógica del juego.
 */

export interface IStorageService {
  /** Lee y deserializa un valor. Retorna `null` si la clave no existe. */
  getItem<T>(key: string): Promise<T | null>;

  /** Serializa y guarda un valor bajo la clave dada. */
  setItem<T>(key: string, value: T): Promise<void>;

  /** Elimina una clave del almacenamiento. */
  removeItem(key: string): Promise<void>;

  /** Borra todo el almacenamiento. */
  clear(): Promise<void>;
}
