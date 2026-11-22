import { describe, expect, it } from 'vitest';
import { Graphics } from 'pixi.js';
import {
  BASE_FURNITURE_CATALOG,
  BASE_WALL_CATALOG,
  getFurnitureDefinition,
  drawBed,
  drawTable,
  drawLamp,
  drawPlant,
  drawPainting,
  drawClock,
  drawWallWindow,
  drawFurnitureShadow,
  drawFallbackFurniture,
  drawFurnitureGraphics,
} from '../index';
import { DEFAULT_ROOM_BOUNDS, isWithinBounds } from '../../../domain';

describe('furnitureCatalog & furnitureDrawers', () => {
  describe('BASE_FURNITURE_CATALOG', () => {
    it('incluye los 4 muebles base con sus metadatos completos y capa floor', () => {
      expect(BASE_FURNITURE_CATALOG.length).toBe(4);

      const expectedIds = ['furniture-bed', 'furniture-table', 'furniture-lamp', 'furniture-plant'];
      for (const id of expectedIds) {
        const item = BASE_FURNITURE_CATALOG.find((f) => f.id === id);
        expect(item).toBeDefined();
        expect(item?.category).toBe('furniture');
        expect(item?.placementLayer).toBe('floor');
        expect(item?.width).toBeGreaterThan(0);
        expect(item?.height).toBeGreaterThan(0);
        expect(item?.name.length).toBeGreaterThan(0);
        expect(item?.description.length).toBeGreaterThan(0);

        // La posición por defecto debe estar dentro de los límites válidos
        expect(isWithinBounds(item!.defaultPosition, DEFAULT_ROOM_BOUNDS)).toBe(true);
      }
    });
  });

  describe('BASE_WALL_CATALOG', () => {
    it('incluye las decoraciones de pared con capa wall', () => {
      expect(BASE_WALL_CATALOG.length).toBeGreaterThanOrEqual(3);

      for (const item of BASE_WALL_CATALOG) {
        expect(item.placementLayer).toBe('wall');
        expect(item.width).toBeGreaterThan(0);
        expect(item.height).toBeGreaterThan(0);
      }
    });
  });

  describe('getFurnitureDefinition', () => {
    it('encuentra el mueble por su ID exacto', () => {
      const def = getFurnitureDefinition('furniture-bed');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Cama Cómoda');
    });

    it('encuentra el mueble por prefijo cuando se usa un ID de instancia con sufijo', () => {
      const def = getFurnitureDefinition('furniture-lamp-instance-123');
      expect(def).toBeDefined();
      expect(def?.id).toBe('furniture-lamp');
      expect(def?.name).toBe('Lámpara de Pie');
    });

    it('encuentra decoraciones de pared por su ID', () => {
      const def = getFurnitureDefinition('wall-painting');
      expect(def).toBeDefined();
      expect(def?.placementLayer).toBe('wall');
    });

    it('retorna undefined para IDs que no corresponden a ningún mueble', () => {
      expect(getFurnitureDefinition('mystery-box')).toBeUndefined();
    });
  });

  describe('drawFurnitureGraphics (Dibujado Vectorial Procedimental)', () => {
    it('dibuja la sombra de contacto elíptica en el Graphics sin errores', () => {
      const g = new Graphics();
      expect(() => drawFurnitureShadow(g, 100)).not.toThrow();
      g.destroy();
    });

    it('dibuja la cama en el Graphics sin errores', () => {
      const g = new Graphics();
      expect(() => drawBed(g)).not.toThrow();
      g.destroy();
    });

    it('dibuja la mesa en el Graphics sin errores', () => {
      const g = new Graphics();
      expect(() => drawTable(g)).not.toThrow();
      g.destroy();
    });

    it('dibuja la lámpara en el Graphics sin errores', () => {
      const g = new Graphics();
      expect(() => drawLamp(g)).not.toThrow();
      g.destroy();
    });

    it('dibuja la planta en el Graphics sin errores', () => {
      const g = new Graphics();
      expect(() => drawPlant(g)).not.toThrow();
      g.destroy();
    });

    it('dibuja los elementos decorativos de pared sin errores', () => {
      const g = new Graphics();
      expect(() => drawPainting(g)).not.toThrow();
      expect(() => drawClock(g)).not.toThrow();
      expect(() => drawWallWindow(g)).not.toThrow();
      g.destroy();
    });

    it('dibuja el mueble de respaldo para identificadores desconocidos', () => {
      const g = new Graphics();
      expect(() => drawFallbackFurniture(g)).not.toThrow();
      g.destroy();
    });

    it('drawFurnitureGraphics despacha adecuadamente según el ID recibido', () => {
      const g = new Graphics();
      expect(() => drawFurnitureGraphics(g, 'furniture-bed')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'furniture-table')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'furniture-lamp')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'furniture-plant')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'wall-painting')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'wall-clock')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'wall-window')).not.toThrow();
      expect(() => drawFurnitureGraphics(g, 'unknown-item')).not.toThrow();
      g.destroy();
    });
  });
});
