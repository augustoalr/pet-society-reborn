/**
 * Implementación agnóstica de ISoundService basada en Web Audio API procedimental.
 *
 * Ventajas arquitectónicas:
 * - 100% sintetizado en código: Cero dependencias de archivos de audio externos (.mp3/.wav),
 *   cero latencia de descarga y cero enlaces rotos.
 * - Sonidos retro/casual estilo Pet Society con envolventes de volumen y modulación de frecuencia.
 * - Manejo defensivo: reanuda el AudioContext en el primer gesto de usuario (política autoplay)
 *   y funciona como no-op seguro si Web Audio API no está disponible en el entorno (Node/SSR/tests).
 * - Persistencia del estado de mute y volumen en Storage (localStorage).
 */

import type { ISoundService, SoundEffectType } from './ISoundService';

export const STORAGE_KEY_AUDIO_MUTED = 'pet-society:audio-muted';
export const STORAGE_KEY_AUDIO_VOLUME = 'pet-society:audio-volume';

export interface SoundEffectsServiceOptions {
  /** Instancia personalizada de AudioContext (útil para inyección de mocks en tests). */
  readonly audioContext?: AudioContext | null;
  /** Instancia personalizada de Storage para persistir preferencias de usuario. */
  readonly storage?: Storage | null;
}

export class SoundEffectsService implements ISoundService {
  private ctx: AudioContext | null = null;
  private masterGainNode: GainNode | null = null;
  private readonly storage: Storage | null;
  private _isMuted = false;
  private _volume = 0.5;

  constructor(options: SoundEffectsServiceOptions = {}) {
    // 1. Resolver almacenamiento
    if (options.storage !== undefined) {
      this.storage = options.storage;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.storage = window.localStorage;
    } else {
      this.storage = null;
    }

    // 2. Cargar preferencias persistidas
    this.loadSettings();

    // 3. Inicializar AudioContext si fue provisto explícitamente
    if (options.audioContext !== undefined) {
      this.ctx = options.audioContext;
      if (this.ctx) {
        this.setupMasterGain();
      }
    }
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  get volume(): number {
    return this._volume;
  }

  /**
   * Activa o desactiva el sonido global y persiste la preferencia.
   */
  setMuted(muted: boolean): void {
    this._isMuted = muted;
    this.updateMasterGain();
    this.saveSettings();
  }

  /**
   * Alterna entre silenciado y activo, retornando el nuevo estado.
   */
  toggleMute(): boolean {
    this.setMuted(!this._isMuted);
    return this._isMuted;
  }

  /**
   * Ajusta el volumen maestro en el rango normalizado [0, 1] y lo persiste.
   */
  setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0.5));
    this._volume = clamped;
    this.updateMasterGain();
    this.saveSettings();
  }

  /**
   * Reanuda el AudioContext en respuesta a un gesto de usuario para cumplir
   * con las restricciones de auto-play del navegador.
   */
  async resumeContext(): Promise<void> {
    const ctx = this.getOrCreateContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        // Silencioso en caso de bloqueo por el navegador
      }
    }
  }

  /**
   * Despacha la reproducción de un efecto de sonido temático procedimental.
   */
  play(effect: SoundEffectType): void {
    if (this._isMuted || this._volume <= 0) {
      return;
    }

    const ctx = this.getOrCreateContext();
    if (!ctx) {
      return;
    }

    // Si el contexto aún está suspendido, intentar reanudarlo asíncronamente
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    try {
      switch (effect) {
        case 'feed':
          this.synthesizeFeed(ctx);
          break;
        case 'clean':
          this.synthesizeClean(ctx);
          break;
        case 'pet':
          this.synthesizePet(ctx);
          break;
        case 'buy':
          this.synthesizeBuy(ctx);
          break;
        case 'ballHit':
          this.synthesizeBallHit(ctx);
          break;
        case 'gameOver':
          this.synthesizeGameOver(ctx);
          break;
      }
    } catch {
      // Manejo defensivo: un error en síntesis de audio nunca debe congelar el juego
    }
  }

  playFeed(): void {
    this.play('feed');
  }

  playClean(): void {
    this.play('clean');
  }

  playPet(): void {
    this.play('pet');
  }

  playBuy(): void {
    this.play('buy');
  }

  playBallHit(): void {
    this.play('ballHit');
  }

  playGameOver(): void {
    this.play('gameOver');
  }

  // =========================================================================
  // Síntesis de Sonido Procedimental (Web Audio API)
  // =========================================================================

  /**
   * Sonido `feed`: Dos mordiscos rápidos y tiernos con caída tonal agradable (masticar).
   */
  private synthesizeFeed(ctx: AudioContext): void {
    const now = ctx.currentTime;
    this.createMunchBite(ctx, now, 320, 160, 0.08);
    this.createMunchBite(ctx, now + 0.1, 360, 180, 0.09);
  }

  private createMunchBite(
    ctx: AudioContext,
    startTime: number,
    startFreq: number,
    endFreq: number,
    duration: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    this.connectAndSchedule(osc, gain, startTime, duration);
  }

  /**
   * Sonido `clean`: Tres burbujas efervescentes ascendentes (jabón y espuma).
   */
  private synthesizeClean(ctx: AudioContext): void {
    const now = ctx.currentTime;
    this.createBubblePop(ctx, now, 420, 820, 0.07);
    this.createBubblePop(ctx, now + 0.06, 560, 1100, 0.06);
    this.createBubblePop(ctx, now + 0.12, 720, 1380, 0.07);
  }

  private createBubblePop(
    ctx: AudioContext,
    startTime: number,
    startFreq: number,
    endFreq: number,
    duration: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), startTime + duration);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + duration * 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    this.connectAndSchedule(osc, gain, startTime, duration);
  }

  /**
   * Sonido `pet`: Arpegio armónico ascendente dulce y cálido (C5 → E5 → G5 → C6)
   * que simula un ronroneo o trino de alegría de la mascota.
   */
  private synthesizePet(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: now, dur: 0.12 }, // C5
      { freq: 659.25, time: now + 0.06, dur: 0.12 }, // E5
      { freq: 783.99, time: now + 0.12, dur: 0.18 }, // G5
      { freq: 1046.5, time: now + 0.18, dur: 0.25 }, // C6
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, note.time);

      gain.gain.setValueAtTime(0.001, note.time);
      gain.gain.linearRampToValueAtTime(0.2, note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, note.time + note.dur);

      this.connectAndSchedule(osc, gain, note.time, note.dur);
    }
  }

  /**
   * Sonido `buy`: Tintineo clásico de campana/monedas de caja registradora retro (B5 → E6).
   */
  private synthesizeBuy(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // Primer tono agudo corto (B5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    this.connectAndSchedule(osc1, gain1, now, 0.08);

    // Segundo tono resonante sostenido (E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, now + 0.07);
    gain2.gain.setValueAtTime(0.001, now + 0.07);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.085);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    this.connectAndSchedule(osc2, gain2, now + 0.07, 0.35);
  }

  /**
   * Sonido `ballHit`: Impacto elástico con barrido de frecuencia rápida (boing / rebote de pelota).
   */
  private synthesizeBallHit(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const duration = 0.12;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + duration);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    this.connectAndSchedule(osc, gain, now, duration);
  }

  /**
   * Sonido `gameOver`: Fanfarria retro de cierre del minijuego con notas descendentes juguetonas.
   */
  private synthesizeGameOver(ctx: AudioContext): void {
    const now = ctx.currentTime;
    const melody = [
      { freq: 392.0, time: now, dur: 0.12 }, // G4
      { freq: 329.63, time: now + 0.12, dur: 0.12 }, // E4
      { freq: 261.63, time: now + 0.24, dur: 0.15 }, // C4
      { freq: 196.0, time: now + 0.39, dur: 0.45 }, // G3
    ];

    for (const note of melody) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, note.time);

      gain.gain.setValueAtTime(0.001, note.time);
      gain.gain.linearRampToValueAtTime(0.25, note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, note.time + note.dur);

      this.connectAndSchedule(osc, gain, note.time, note.dur);
    }
  }

  /**
   * Conecta el oscilador al nodo de ganancia local y este al máster gain, programando su inicio y fin.
   */
  private connectAndSchedule(
    osc: OscillatorNode,
    gain: GainNode,
    startTime: number,
    duration: number
  ): void {
    try {
      const targetDestination = this.masterGainNode ?? this.ctx?.destination;
      if (!targetDestination) {
        return;
      }

      osc.connect(gain);
      gain.connect(targetDestination);

      osc.start(startTime);
      const stopTime = startTime + duration + 0.02;
      osc.stop(stopTime);

      osc.onended = () => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {
          // Desconexión segura
        }
      };
    } catch {
      // Ignorar si el audio node no pudo conectarse
    }
  }

  // =========================================================================
  // Manejo Interno de AudioContext y Persistencia
  // =========================================================================

  private getOrCreateContext(): AudioContext | null {
    if (this.ctx) {
      return this.ctx;
    }

    if (typeof window === 'undefined') {
      return null;
    }

    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtxClass) {
      return null;
    }

    try {
      this.ctx = new AudioCtxClass();
      this.setupMasterGain();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private setupMasterGain(): void {
    if (!this.ctx) {
      return;
    }

    try {
      this.masterGainNode = this.ctx.createGain();
      this.updateMasterGain();
      this.masterGainNode.connect(this.ctx.destination);
    } catch {
      this.masterGainNode = null;
    }
  }

  private updateMasterGain(): void {
    if (!this.masterGainNode || !this.ctx) {
      return;
    }

    try {
      const targetGain = this._isMuted ? 0 : this._volume;
      this.masterGainNode.gain.setValueAtTime(targetGain, this.ctx.currentTime);
    } catch {
      // Ignorar si AudioContext fue cerrado
    }
  }

  private loadSettings(): void {
    if (!this.storage) {
      return;
    }

    try {
      const storedMuted = this.storage.getItem(STORAGE_KEY_AUDIO_MUTED);
      if (storedMuted !== null) {
        this._isMuted = storedMuted === 'true';
      }

      const storedVolume = this.storage.getItem(STORAGE_KEY_AUDIO_VOLUME);
      if (storedVolume !== null) {
        const parsed = parseFloat(storedVolume);
        if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
          this._volume = parsed;
        }
      }
    } catch {
      // Fallback a valores por defecto si el storage falla
    }
  }

  private saveSettings(): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(STORAGE_KEY_AUDIO_MUTED, String(this._isMuted));
      this.storage.setItem(STORAGE_KEY_AUDIO_VOLUME, String(this._volume));
    } catch {
      // Fallback silencioso en caso de QuotaExceededError o storage inaccesible
    }
  }
}

/** Instancia compartida por defecto (Singleton de runtime en infraestructura) */
export const soundService: ISoundService = new SoundEffectsService();
