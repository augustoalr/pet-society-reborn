import { describe, expect, it } from 'vitest';
import { Ticker } from 'pixi.js';
import type { PetAppearance } from '../../../domain';
import { PetView } from '../PetView';
import { PET_LAYER_NAMES, PET_LAYER_ORDER } from '../types';

describe('PetView', () => {
  const defaultAppearance: PetAppearance = {
    color: 'pink',
    eyes: 'round',
    mouth: 'smile',
    ears: 'floppy',
  };

  it('inicializa con 7 capas en el orden estricto de renderizado', () => {
    const petView = new PetView(defaultAppearance);

    expect(petView.layerCount).toBe(7);
    expect(petView.children.length).toBe(7);

    // Comprobar que cada capa ocupa el índice exacto definido en PET_LAYER_ORDER
    expect(petView.children[PET_LAYER_ORDER.BACK_EARS].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.BACK_EARS]
    );
    expect(petView.children[PET_LAYER_ORDER.BODY].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.BODY]
    );
    expect(petView.children[PET_LAYER_ORDER.HEAD].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.HEAD]
    );
    expect(petView.children[PET_LAYER_ORDER.FRONT_EARS].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.FRONT_EARS]
    );
    expect(petView.children[PET_LAYER_ORDER.EYES].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.EYES]
    );
    expect(petView.children[PET_LAYER_ORDER.MOUTH_AND_CHEEKS].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.MOUTH_AND_CHEEKS]
    );
    expect(petView.children[PET_LAYER_ORDER.CLOTHES].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.CLOTHES]
    );

    petView.destroy();
  });

  it('getLayer retorna la capa gráfica correcta o lanza error ante índice inválido', () => {
    const petView = new PetView(defaultAppearance);

    const headLayer = petView.getLayer(PET_LAYER_ORDER.HEAD);
    expect(headLayer.label).toBe('head');

    expect(() => petView.getLayer(99 as unknown as 0)).toThrow();

    petView.destroy();
  });

  it('updateAppearance actualiza la configuración sin recrear los nodos del árbol', () => {
    const petView = new PetView(defaultAppearance);
    const initialChildren = [...petView.children];

    const newAppearance: PetAppearance = {
      color: 'orange',
      eyes: 'happy',
      mouth: 'open',
      ears: 'pointy',
    };

    petView.updateAppearance(newAppearance, ['party-hat', 'red-shirt']);

    expect(petView.appearance).toEqual(newAppearance);
    expect(petView.clothes.hat).toBe('party-hat');
    expect(petView.clothes.shirt).toBe('red-shirt');

    // Los nodos hijos deben ser los mismos objetos (eficiencia en memoria)
    expect(petView.children.length).toBe(7);
    for (let i = 0; i < 7; i++) {
      expect(petView.children[i]).toBe(initialChildren[i]);
    }

    petView.destroy();
  });

  it('setPosition actualiza las coordenadas de la mascota', () => {
    const petView = new PetView(defaultAppearance);

    petView.setPosition(400, 350);
    expect(petView.x).toBe(400);
    expect(petView.y).toBe(350);

    petView.destroy();
  });

  it('soporta inicio, actualización y detención de animación idle', () => {
    const petView = new PetView(defaultAppearance);
    const customTicker = new Ticker();
    customTicker.autoStart = false;
    customTicker.stop();

    petView.startIdleAnimation(customTicker);

    // Simular el avance de varios ticks
    customTicker.update(100);
    customTicker.update(200);

    // Detener la animación debe restablecer transformaciones
    petView.stopIdleAnimation();

    const bodyLayer = petView.getLayer(PET_LAYER_ORDER.BODY);
    expect(bodyLayer.scale.x).toBe(1);
    expect(bodyLayer.scale.y).toBe(1);

    const headLayer = petView.getLayer(PET_LAYER_ORDER.HEAD);
    expect(headLayer.y).toBe(0);

    customTicker.destroy();
    petView.destroy();
  });
});
