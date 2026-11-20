/**
 * Contrato agnóstico del servicio de efectos de sonido (R-02: Agnosticismo de Dependencias).
 *
 * Cualquier implementación (Web Audio API procedimental, Howler, HTML5 Audio, etc.)
 * debe cumplir esta interfaz. El resto del juego solo conoce ISoundService,
 * permitiendo cambiar el motor de sonido sin modificar la lógica ni los componentes.
 */

export type SoundEffectType = 'feed' | 'clean' | 'pet' | 'buy' | 'ballHit' | 'gameOver';

export interface ISoundService {
  /**
   * Reproduce un efecto de sonido temático procedimental.
   */
  play(effect: SoundEffectType): void;

  /** Atajo para reproducir sonido de masticar/comer. */
  playFeed(): void;

  /** Atajo para reproducir sonido burbujeante de limpieza/jabón. */
  playClean(): void;

  /** Atajo para reproducir trino armónico o ronroneo de afecto. */
  playPet(): void;

  /** Atajo para reproducir tintineo de monedas/caja registradora. */
  playBuy(): void;

  /** Atajo para reproducir bote o impacto elástico de la pelota. */
  playBallHit(): void;

  /** Atajo para reproducir fanfarria de cierre del minijuego. */
  playGameOver(): void;

  /** Estado actual de silencio. */
  readonly isMuted: boolean;

  /** Activa o desactiva el sonido globalmente. */
  setMuted(muted: boolean): void;

  /** Alterna entre silenciado y activo, retornando el nuevo estado. */
  toggleMute(): boolean;

  /** Nivel de volumen normalizado en el rango [0, 1]. */
  readonly volume: number;

  /** Ajusta el volumen maestro en el rango [0, 1]. */
  setVolume(volume: number): void;

  /**
   * Reanuda el AudioContext en respuesta a una interacción del usuario.
   * Manejo defensivo para cumplir la política de auto-play del navegador.
   */
  resumeContext(): Promise<void>;
}
