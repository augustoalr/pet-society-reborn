import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SoundEffectsService,
  STORAGE_KEY_AUDIO_MUTED,
  STORAGE_KEY_AUDIO_VOLUME,
} from '../SoundEffectsService';
import { InMemoryStorage } from '../../storage/__tests__/InMemoryStorage';

// Creación de mocks para Web Audio API
function createMockAudioContext(initialState: AudioContextState = 'suspended') {
  let state: AudioContextState = initialState;
  const currentTime = 10.0;

  const destination = {} as AudioDestinationNode;

  const mockGainParam = {
    value: 1,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };

  const createGain = vi.fn(() => ({
    gain: mockGainParam,
    connect: vi.fn(),
    disconnect: vi.fn(),
  }));

  const mockFreqParam = {
    value: 440,
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };

  const createOscillator = vi.fn(() => ({
    type: 'sine',
    frequency: mockFreqParam,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  }));

  const resume = vi.fn(async () => {
    state = 'running';
  });

  return {
    get state() {
      return state;
    },
    currentTime,
    destination,
    createGain,
    createOscillator,
    resume,
  } as unknown as AudioContext;
}

describe('SoundEffectsService', () => {
  let storage: InMemoryStorage;
  let mockCtx: AudioContext;

  beforeEach(() => {
    storage = new InMemoryStorage();
    mockCtx = createMockAudioContext();
  });

  it('inicializa con volumen y mute por defecto cuando el almacenamiento está vacío', () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });
    expect(service.isMuted).toBe(false);
    expect(service.volume).toBe(0.5);
  });

  it('carga configuración previa persistida en el almacenamiento', () => {
    storage.setItem(STORAGE_KEY_AUDIO_MUTED, 'true');
    storage.setItem(STORAGE_KEY_AUDIO_VOLUME, '0.8');

    const service = new SoundEffectsService({ audioContext: mockCtx, storage });
    expect(service.isMuted).toBe(true);
    expect(service.volume).toBe(0.8);
  });

  it('ajusta el volumen respetando el rango [0, 1] y lo persiste', () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });

    service.setVolume(0.75);
    expect(service.volume).toBe(0.75);
    expect(storage.getItem(STORAGE_KEY_AUDIO_VOLUME)).toBe('0.75');

    // Clamping superior
    service.setVolume(1.5);
    expect(service.volume).toBe(1);

    // Clamping inferior
    service.setVolume(-0.2);
    expect(service.volume).toBe(0);
  });

  it('silencia y desilencia el audio, alternando el estado y persistiéndolo', () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });

    service.setMuted(true);
    expect(service.isMuted).toBe(true);
    expect(storage.getItem(STORAGE_KEY_AUDIO_MUTED)).toBe('true');

    const toggled = service.toggleMute();
    expect(toggled).toBe(false);
    expect(service.isMuted).toBe(false);
    expect(storage.getItem(STORAGE_KEY_AUDIO_MUTED)).toBe('false');
  });

  it('reanuda el AudioContext si está suspendido al llamar a resumeContext', async () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });
    expect(mockCtx.state).toBe('suspended');

    await service.resumeContext();
    expect(mockCtx.resume).toHaveBeenCalled();
    expect(mockCtx.state).toBe('running');
  });

  it('reproduce sonidos procedimentales generando osciladores y nodos de ganancia', () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });

    service.playFeed();
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();

    service.playClean();
    service.playPet();
    service.playBuy();
    service.playBallHit();
    service.playGameOver();

    // Verificamos que todos los sonidos invocaron generadores de audio
    expect(vi.mocked(mockCtx.createOscillator).mock.calls.length).toBeGreaterThan(6);
  });

  it('no genera osciladores si el servicio está silenciado', () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });
    service.setMuted(true);

    const callCountBefore = vi.mocked(mockCtx.createOscillator).mock.calls.length;
    service.play('feed');
    service.play('ballHit');
    service.play('buy');

    const callCountAfter = vi.mocked(mockCtx.createOscillator).mock.calls.length;
    expect(callCountAfter).toBe(callCountBefore);
  });

  it('no genera osciladores si el volumen es 0', () => {
    const service = new SoundEffectsService({ audioContext: mockCtx, storage });
    service.setVolume(0);

    const callCountBefore = vi.mocked(mockCtx.createOscillator).mock.calls.length;
    service.play('pet');
    const callCountAfter = vi.mocked(mockCtx.createOscillator).mock.calls.length;
    expect(callCountAfter).toBe(callCountBefore);
  });

  it('funciona de manera segura como no-op cuando no hay AudioContext ni Storage disponibles', async () => {
    const service = new SoundEffectsService({ audioContext: null, storage: null });

    expect(() => {
      service.setVolume(0.8);
      service.setMuted(true);
      service.toggleMute();
      service.play('feed');
      service.playClean();
      service.playPet();
      service.playBuy();
      service.playBallHit();
      service.playGameOver();
    }).not.toThrow();

    await expect(service.resumeContext()).resolves.toBeUndefined();
  });
});
