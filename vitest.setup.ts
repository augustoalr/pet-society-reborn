/**
 * Setup para el entorno de pruebas en Node.js (Vitest).
 *
 * Provee polyfills mínimos requeridos por librerías gráficas (PixiJS)
 * y Vitest en entornos headless donde `window` y `navigator` no existen de forma nativa
 * (como Node 20 en entornos de CI).
 */

if (typeof globalThis.navigator === 'undefined') {
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: 'Node.js/Vitest' },
    writable: true,
    configurable: true,
  });
}

// Polyfill para Map.groupBy en Node < 21
if (typeof (Map as unknown as { groupBy?: unknown }).groupBy !== 'function') {
  (
    Map as unknown as {
      groupBy: <T, K>(items: Iterable<T>, keySelector: (item: T) => K) => Map<K, T[]>;
    }
  ).groupBy = function <T, K>(
    items: Iterable<T>,
    keySelector: (item: T) => K
  ): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of items) {
      const key = keySelector(item);
      let group = map.get(key);
      if (!group) {
        group = [];
        map.set(key, group);
      }
      group.push(item);
    }
    return map;
  };
}
