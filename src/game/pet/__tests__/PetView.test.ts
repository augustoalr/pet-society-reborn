import { describe, expect, it, vi } from 'vitest';
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

  it('inicializa con 8 capas en el orden estricto de renderizado (incluyendo sombra)', () => {
    const petView = new PetView(defaultAppearance);

    expect(petView.layerCount).toBe(8);
    expect(petView.children.length).toBe(8);

    // Comprobar que cada capa ocupa el índice exacto definido en PET_LAYER_ORDER
    expect(petView.children[PET_LAYER_ORDER.SHADOW].label).toBe(
      PET_LAYER_NAMES[PET_LAYER_ORDER.SHADOW]
    );
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

    const shadowLayer = petView.getLayer(PET_LAYER_ORDER.SHADOW);
    expect(shadowLayer.label).toBe('shadow');

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
    expect(petView.children.length).toBe(8);
    for (let i = 0; i < 8; i++) {
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

  it('soporta inicio, actualización y detención de animación idle con deformación elástica', () => {
    const petView = new PetView(defaultAppearance);
    const customTicker = new Ticker();
    customTicker.autoStart = false;
    customTicker.stop();

    petView.startIdleAnimation(customTicker);

    // Simular el avance de varios ticks
    customTicker.update(100);
    customTicker.update(200);

    // Detener la animación debe restablecer transformaciones neutrales
    petView.stopIdleAnimation();

    const bodyLayer = petView.getLayer(PET_LAYER_ORDER.BODY);
    expect(bodyLayer.scale.x).toBe(1);
    expect(bodyLayer.scale.y).toBe(1);
    expect(bodyLayer.rotation).toBe(0);

    const headLayer = petView.getLayer(PET_LAYER_ORDER.HEAD);
    expect(headLayer.y).toBe(0);
    expect(headLayer.scale.x).toBe(1);
    expect(headLayer.scale.y).toBe(1);

    const shadowLayer = petView.getLayer(PET_LAYER_ORDER.SHADOW);
    expect(shadowLayer.scale.x).toBe(1);

    petView.destroy();
    customTicker.destroy();
  });

  it('walkTo inicia desplazamiento, aplica flip horizontal y notifica la llegada', () => {
    const petView = new PetView(defaultAppearance);
    petView.setPosition(300, 400);

    const customTicker = new Ticker();
    customTicker.autoStart = false;
    customTicker.stop();
    petView.startIdleAnimation(customTicker);

    const onArrival = vi.fn();

    // Mover hacia la izquierda (200 < 300) -> facing debe ser -1 (flip horizontal)
    petView.walkTo(200, 400, onArrival);
    expect(petView.isWalking).toBe(true);
    expect(petView.facing).toBe(-1);
    expect(petView.scale.x).toBe(-1);

    // Simular avance progresivo en el tiempo hasta llegar al destino
    // Distancia = 100 px. A 180 px/s, tarda ~0.55s
    let currentTime = 0;
    for (let i = 0; i < 50; i++) {
      currentTime += 20; // 20ms cada frame
      customTicker.update(currentTime);
    }

    expect(petView.isWalking).toBe(false);
    expect(petView.x).toBe(200);
    expect(petView.y).toBe(400);
    expect(onArrival).toHaveBeenCalledTimes(1);

    // Mover hacia la derecha (500 > 200) -> facing debe ser 1 (flip horizontal)
    petView.walkTo(500, 420);
    expect(petView.isWalking).toBe(true);
    expect(petView.facing).toBe(1);
    expect(petView.scale.x).toBe(1);

    // Detener la caminata manualmente
    petView.stopWalking();
    expect(petView.isWalking).toBe(false);

    petView.destroy();
    customTicker.destroy();
  });

  it('setCursorPosition orienta la mirada de la mascota', () => {
    const petView = new PetView(defaultAppearance);
    petView.setPosition(400, 350);

    const customTicker = new Ticker();
    customTicker.autoStart = false;
    customTicker.stop();
    petView.startIdleAnimation(customTicker);

    // Establecer cursor hacia la derecha
    petView.setCursorPosition({ x: 600, y: 350 });

    let currentTime = 0;
    for (let i = 0; i < 15; i++) {
      currentTime += 20;
      customTicker.update(currentTime);
    }

    // Al limpiar la posición del cursor, la mirada vuelve suavemente al centro
    petView.setCursorPosition(null);
    for (let i = 0; i < 20; i++) {
      currentTime += 20;
      customTicker.update(currentTime);
    }

    petView.destroy();
    customTicker.destroy();
  });
});
