import React from 'react';
import type { MinigameStatus } from '../../domain';
import { theme } from '../../styles';

export interface MinigameHUDProps {
  /** Estado de la partida ('idle', 'playing', 'game_over'). */
  readonly status: MinigameStatus;
  /** Toques consecutivos en la ronda actual. */
  readonly score: number;
  /** Racha o combo actual. */
  readonly combo: number;
  /** Puntuación máxima lograda en la sesión. */
  readonly highScore: number;
  /** Total de monedas acumuladas ganadas durante la sesión en el jardín. */
  readonly sessionCoins: number;
  /** Monedas acreditadas en la última partida finalizada. */
  readonly lastEarnedCoins?: number;
  /** Puntos de felicidad otorgados a la mascota en la última partida. */
  readonly lastEarnedHappiness?: number;
  /** Callback para iniciar una nueva ronda de pelota. */
  readonly onRestart: () => void;
  /** Callback para salir del jardín y volver a la habitación de la mascota. */
  readonly onExitToRoom: () => void;
}

/**
 * HUD y pantallas superpuestas para el minijuego de pelota en el jardín exterior.
 *
 * Incluye:
 * - Marcador superior flotante con toques, racha/combo, récord y monedas ganadas.
 * - Indicador orientativo durante el estado 'idle' para incentivar el primer toque.
 * - Pantalla modal de 'Game Over' con desglose de toques, monedas y felicidad ganadas.
 */
export const MinigameHUD: React.FC<MinigameHUDProps> = ({
  status,
  score,
  combo,
  highScore,
  sessionCoins,
  lastEarnedCoins = 0,
  lastEarnedHappiness = 0,
  onRestart,
  onExitToRoom,
}) => {
  const isNewRecord = score > 0 && score >= highScore;

  return (
    <>
      {/* 1. Marcador superior flotante durante el juego */}
      <div
        style={{
          position: 'absolute',
          top: theme.spacing.small,
          left: theme.spacing.medium,
          right: theme.spacing.medium,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Lado izquierdo: Toques y combo actual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#FFFFFF',
              padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
              borderRadius: theme.borderRadius.pill,
              fontFamily: 'sans-serif',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >
            <span aria-hidden="true">⚽</span>
            <span>Toques:</span>
            <span style={{ color: theme.colors.coinGold, fontSize: '1.1rem' }}>
              {score}
            </span>
          </div>

          {combo > 1 && (
            <div
              style={{
                backgroundColor: theme.colors.accent,
                color: '#FFFFFF',
                padding: `2px ${theme.spacing.small}`,
                borderRadius: theme.borderRadius.pill,
                fontFamily: 'sans-serif',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: 'pulse 1s infinite',
              }}
            >
              {`🔥 Combo x${combo}!`}
            </div>
          )}
        </div>

        {/* Lado derecho: Récord, monedas acumuladas y botón de salida */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.small,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#FFFFFF',
              padding: `${theme.spacing.xs} ${theme.spacing.small}`,
              borderRadius: theme.borderRadius.pill,
              fontFamily: 'sans-serif',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span aria-hidden="true">🏆</span>
            <span>Récord:</span>
            <span style={{ fontWeight: 'bold' }}>{highScore}</span>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: theme.colors.coinGold,
              padding: `${theme.spacing.xs} ${theme.spacing.small}`,
              borderRadius: theme.borderRadius.pill,
              fontFamily: 'sans-serif',
              fontSize: '0.82rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span aria-hidden="true">🪙</span>
            <span>{`+${sessionCoins}`}</span>
          </div>

          <button
            type="button"
            onClick={onExitToRoom}
            aria-label="Volver a la Habitación"
            style={{
              backgroundColor: theme.colors.primaryDark,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.borderRadius.small,
              padding: `${theme.spacing.xs} ${theme.spacing.small}`,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <span aria-hidden="true">🏠</span>
            <span>Volver a casa</span>
          </button>
        </div>
      </div>

      {/* 2. Banner de instrucción en estado 'idle' */}
      {status === 'idle' && (
        <div
          style={{
            position: 'absolute',
            bottom: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            color: '#FFFFFF',
            padding: `${theme.spacing.small} ${theme.spacing.large}`,
            borderRadius: theme.borderRadius.pill,
            fontFamily: 'sans-serif',
            textAlign: 'center',
            zIndex: 10,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontSize: '0.92rem', fontWeight: 'bold' }}>
            ✨ ¡Toca o haz clic en la pelota para comenzar los malabares! ✨
          </div>
          <div style={{ fontSize: '0.78rem', color: '#D1D5DB', marginTop: '2px' }}>
            Golpea la pelota antes de que caiga al suelo para ganar monedas y felicidad.
          </div>
        </div>
      )}

      {/* 3. Pantalla modal de Game Over */}
      {status === 'game_over' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: theme.colors.modalOverlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 25,
            padding: theme.spacing.medium,
          }}
        >
          <div
            role="dialog"
            aria-labelledby="game-over-title"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderRadius: theme.borderRadius.large,
              padding: theme.spacing.large,
              width: '100%',
              maxWidth: '380px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              border: `1px solid ${theme.colors.cardBorder}`,
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: theme.spacing.xs }}>
              {isNewRecord ? '🌟' : '⚽'}
            </div>

            <h2
              id="game-over-title"
              style={{
                margin: 0,
                color: theme.colors.text,
                fontSize: '1.4rem',
                fontWeight: 'bold',
              }}
            >
              ¡Fin de la partida!
            </h2>

            <p
              style={{
                margin: `${theme.spacing.xs} 0 ${theme.spacing.medium}`,
                color: theme.colors.textMuted,
                fontSize: '0.88rem',
              }}
            >
              La pelota tocó el césped del jardín.
            </p>

            {/* Resumen de estadísticas y recompensas */}
            <div
              style={{
                backgroundColor: theme.colors.inactiveOption,
                borderRadius: theme.borderRadius.medium,
                padding: theme.spacing.medium,
                marginBottom: theme.spacing.medium,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.small,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ color: theme.colors.textMuted }}>Toques logrados:</span>
                <span style={{ fontWeight: 'bold', color: theme.colors.text }}>
                  {score}
                </span>
              </div>

              {isNewRecord && (
                <div
                  style={{
                    backgroundColor: theme.colors.tagBackground,
                    color: theme.colors.tagText,
                    fontSize: '0.78rem',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: theme.borderRadius.pill,
                    alignSelf: 'center',
                  }}
                >
                  🌟 ¡Nuevo récord de la sesión!
                </div>
              )}

              <div
                style={{
                  height: '1px',
                  backgroundColor: theme.colors.cardBorder,
                  margin: '4px 0',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ color: theme.colors.textMuted }}>Monedas ganadas:</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    color: theme.colors.coinGold,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {`+${lastEarnedCoins} 🪙`}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.95rem',
                }}
              >
                <span style={{ color: theme.colors.textMuted }}>Felicidad:</span>
                <span
                  style={{
                    fontWeight: 'bold',
                    color: theme.colors.danger,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {`+${lastEarnedHappiness} ❤️`}
                </span>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: theme.spacing.small }}>
              <button
                type="button"
                onClick={onRestart}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: theme.borderRadius.medium,
                  padding: `${theme.spacing.small} ${theme.spacing.medium}`,
                  fontSize: '0.95rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                }}
              >
                Jugar de nuevo 🔄
              </button>

              <button
                type="button"
                onClick={onExitToRoom}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.inactiveOption,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.cardBorder}`,
                  borderRadius: theme.borderRadius.medium,
                  padding: `${theme.spacing.small} ${theme.spacing.medium}`,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Volver a casa 🏠
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
