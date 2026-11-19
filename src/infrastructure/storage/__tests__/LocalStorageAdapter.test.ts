import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from '../LocalStorageAdapter';
import { InMemoryStorage } from './InMemoryStorage';

describe('LocalStorageAdapter', () => {
  let storage: InMemoryStorage;
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    storage = new InMemoryStorage();
    adapter = new LocalStorageAdapter(storage);
  });

  // ─── getItem ───────────────────────────────────────────────

  it('retorna null para una clave inexistente', async () => {
    const result = await adapter.getItem('no-existe');
    expect(result).toBeNull();
  });

  it('recupera un valor previamente guardado', async () => {
    const data = { nombre: 'Luna', nivel: 3 };
    await adapter.setItem('mascota', data);

    const result = await adapter.getItem<typeof data>('mascota');
    expect(result).toEqual(data);
  });

  it('recupera valores primitivos (string, number, boolean)', async () => {
    await adapter.setItem('str', 'hello');
    await adapter.setItem('num', 42);
    await adapter.setItem('bool', true);

    expect(await adapter.getItem('str')).toBe('hello');
    expect(await adapter.getItem('num')).toBe(42);
    expect(await adapter.getItem('bool')).toBe(true);
  });

  it('recupera arrays correctamente', async () => {
    const items = [1, 2, 3];
    await adapter.setItem('arr', items);
    expect(await adapter.getItem('arr')).toEqual([1, 2, 3]);
  });

  // ─── JSON corrupto ────────────────────────────────────────

  it('retorna null cuando el JSON almacenado está corrupto', async () => {
    // Escribimos basura directamente en el storage subyacente
    storage.setItem('corrupto', '{esto no es json válido!!!');

    const result = await adapter.getItem('corrupto');
    expect(result).toBeNull();
  });

  it('retorna null para JSON parcial / truncado', async () => {
    storage.setItem('truncado', '{"nombre":"Luna"');

    const result = await adapter.getItem('truncado');
    expect(result).toBeNull();
  });

  // ─── setItem ───────────────────────────────────────────────

  it('sobrescribe un valor existente', async () => {
    await adapter.setItem('clave', 'valor1');
    await adapter.setItem('clave', 'valor2');

    expect(await adapter.getItem('clave')).toBe('valor2');
  });

  it('propaga QuotaExceededError del storage subyacente', async () => {
    storage.throwOnSet = true;

    await expect(adapter.setItem('clave', 'valor')).rejects.toThrow(
      /quota/i,
    );
  });

  // ─── removeItem ────────────────────────────────────────────

  it('elimina una clave existente', async () => {
    await adapter.setItem('temporal', 'data');
    await adapter.removeItem('temporal');

    expect(await adapter.getItem('temporal')).toBeNull();
  });

  it('no lanza error al eliminar una clave inexistente', async () => {
    // removeItem de una clave que no existe no debe lanzar
    await expect(adapter.removeItem('fantasma')).resolves.toBeUndefined();
  });

  // ─── clear ─────────────────────────────────────────────────

  it('limpia todo el almacenamiento', async () => {
    await adapter.setItem('a', 1);
    await adapter.setItem('b', 2);
    await adapter.setItem('c', 3);

    await adapter.clear();

    expect(await adapter.getItem('a')).toBeNull();
    expect(await adapter.getItem('b')).toBeNull();
    expect(await adapter.getItem('c')).toBeNull();
  });
});
