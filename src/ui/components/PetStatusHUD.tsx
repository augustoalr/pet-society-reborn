import React from 'react';
import type { PetNeeds, Wallet } from '../../domain';
import { theme } from '../../styles';

export interface PetStatusHUDProps {
  readonly petName: string;
  readonly level: number;
  readonly needs: PetNeeds;
  readonly wallet?: Wallet;
}

interface NeedItemConfig {
  readonly id: keyof PetNeeds;
  readonly label: string;
  readonly icon: string;
  readonly value: number;
  readonly normalGradient: string;
  readonly criticalGradient: string;
}

/**
 * Icono vectorial de moneda dorada brillante estilo Flash.
 */
export const GoldenCoinIcon: React.FC<{ readonly size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))', flexShrink: 0 }}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="coinGrad" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFF9C4" />
        <stop offset="40%" stopColor="#FFD54F" />
        <stop offset="85%" stopColor="#FFA000" />
        <stop offset="100%" stopColor="#E65100" />
      </radialGradient>
      <linearGradient id="coinBorder" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE082" />
        <stop offset="100%" stopColor="#B26A00" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10.5" fill="url(#coinGrad)" stroke="url(#coinBorder)" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="8" fill="none" stroke="#FFECB3" strokeWidth="0.8" strokeDasharray="1.5 1.5" opacity="0.8" />
    {/* Estrella / Brillo central */}
    <path
      d="M12 6.5L13.5 10.5L17.5 12L13.5 13.5L12 17.5L10.5 13.5L6.5 12L10.5 10.5Z"
      fill="#FFFDE7"
      opacity="0.9"
    />
  </svg>
);

/**
 * Icono vectorial de billete Playfish Cash estilo Flash.
 */
export const PlayfishCashIcon: React.FC<{ readonly size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={Math.round(size * 0.72)}
    viewBox="0 0 28 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))', flexShrink: 0 }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#81C784" />
        <stop offset="45%" stopColor="#43A047" />
        <stop offset="100%" stopColor="#1B5E20" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="26" height="18" rx="3.5" fill="url(#cashGrad)" stroke="#0D5314" strokeWidth="1.2" />
    <rect x="2.5" y="2.5" width="23" height="15" rx="2" fill="none" stroke="#A5D6A7" strokeWidth="0.8" opacity="0.85" />
    {/* Símbolo de dólar / Playfish en el centro */}
    <circle cx="14" cy="10" r="4.2" fill="#E8F5E9" fillOpacity="0.25" stroke="#E8F5E9" strokeWidth="0.8" />
    <text
      x="14"
      y="12.5"
      textAnchor="middle"
      fill="#FFFFFF"
      fontSize="9"
      fontWeight="900"
      fontFamily="sans-serif"
    >
      $
    </text>
  </svg>
);

/**
 * Mini-barra de necesidad compacta con relieve y brillo superior de píldora Flash.
 */
const CompactNeedBar: React.FC<{
  readonly label: string;
  readonly icon: string;
  readonly value: number;
  readonly normalGradient: string;
  readonly criticalGradient: string;
}> = ({ label, icon, value, normalGradient, criticalGradient }) => {
  const roundedValue = Math.round(Math.max(0, Math.min(100, value)));
  const isCritical = roundedValue < 30;
  const fillGradient = isCritical ? criticalGradient : normalGradient;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}
    >
      {/* Etiqueta compacta con icono y porcentaje */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: theme.colors.text,
          lineHeight: 1,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <span style={{ fontSize: '0.85rem' }} aria-hidden="true">
            {icon}
          </span>
          <span>{label}</span>
        </span>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            color: isCritical ? theme.colors.statusDanger : theme.colors.textMuted,
          }}
        >
          {`${roundedValue}%`}
        </span>
      </div>

      {/* Mini-píldora Flash con ranura oscura y brillo superior */}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={roundedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height: '11px',
          backgroundColor: theme.colors.flashMeterTrack,
          borderRadius: theme.borderRadius.pill,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.4)',
          border: '1px solid rgba(61, 43, 31, 0.4)',
        }}
      >
        {/* Relleno de color vibrante */}
        <div
          style={{
            width: `${roundedValue}%`,
            height: '100%',
            background: fillGradient,
            borderRadius: theme.borderRadius.pill,
            position: 'relative',
            transition: 'width 0.35s ease-out',
          }}
        >
          {/* Brillo superior tipo gel/cristal Flash */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: theme.colors.flashGlossHighlight,
              borderRadius: theme.borderRadius.pill,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * HUD Superior de Videojuego Estilo Pet Society Flash (Playfish 2008-2013).
 *
 * Características:
 * - Cápsula / Pod superpuesto en la esquina superior izquierda.
 * - Nombre de mascota con tipografía de caricatura y relieve.
 * - Medallón de nivel de mascota con icono de patita (Paw Points).
 * - Indicadores de economía con iconos vectoriales de Moneda Dorada y Playfish Cash.
 * - 4 mini-barras compactas de necesidades vitales (Hambre, Higiene, Energía, Felicidad)
 *   con fondo oscuro de ranura, color vibrante y brillo gel superior.
 */
export const PetStatusHUD: React.FC<PetStatusHUDProps> = ({
  petName,
  level,
  needs,
  wallet,
}) => {
  const needsConfig: readonly NeedItemConfig[] = [
    {
      id: 'hunger',
      label: 'Hambre',
      icon: '🍎',
      value: needs.hunger,
      normalGradient: 'linear-gradient(180deg, #FF8A65 0%, #E64A19 50%, #BF360C 100%)',
      criticalGradient: 'linear-gradient(180deg, #EF5350 0%, #E53935 50%, #B71C1C 100%)',
    },
    {
      id: 'hygiene',
      label: 'Higiene',
      icon: '🧼',
      value: needs.hygiene,
      normalGradient: 'linear-gradient(180deg, #4FC3F7 0%, #0288D1 50%, #01579B 100%)',
      criticalGradient: 'linear-gradient(180deg, #EF5350 0%, #E53935 50%, #B71C1C 100%)',
    },
    {
      id: 'energy',
      label: 'Energía',
      icon: '⚡',
      value: needs.energy,
      normalGradient: 'linear-gradient(180deg, #FFF176 0%, #FBC02D 50%, #F57F17 100%)',
      criticalGradient: 'linear-gradient(180deg, #EF5350 0%, #E53935 50%, #B71C1C 100%)',
    },
    {
      id: 'happiness',
      label: 'Felicidad',
      icon: '❤️',
      value: needs.happiness,
      normalGradient: 'linear-gradient(180deg, #F06292 0%, #D81B60 50%, #880E4F 100%)',
      criticalGradient: 'linear-gradient(180deg, #EF5350 0%, #E53935 50%, #B71C1C 100%)',
    },
  ];

  return (
    <aside
      aria-label="Estado vital y economía de la mascota"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: theme.colors.flashPodBackground,
        border: theme.colors.flashPodBorder,
        borderRadius: theme.borderRadius.xlarge,
        boxShadow: theme.colors.flashPodShadow,
        padding: '10px 14px',
        width: 'calc(100vw - 32px)',
        maxWidth: '340px',
        fontFamily: theme.typography.fontFamily,
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {/* Fila 1: Nombre de la mascota y Medallón de Nivel (Paw Points) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <span
            style={{
              fontWeight: 900,
              fontSize: '1.05rem',
              color: '#3E2723',
              textShadow: '0 1px 0 rgba(255,255,255,0.9)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {petName}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#FFFFFF',
              background: theme.colors.flashBadgeBackground,
              border: theme.colors.flashBadgeBorder,
              borderRadius: theme.borderRadius.pill,
              padding: '2px 8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <span aria-hidden="true">🐾</span>
            <span>{`Nvl ${level}`}</span>
          </span>
        </div>

        {/* Fila de Economía (Coins y Playfish Cash) */}
        {wallet && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {/* Cápsula de Monedas */}
            <div
              title={`Monedas: ${wallet.coins}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255, 248, 225, 0.9)',
                border: '1.5px solid #FFD54F',
                borderRadius: theme.borderRadius.pill,
                padding: '2px 7px 2px 4px',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 4px rgba(60,40,20,0.12)',
              }}
            >
              <GoldenCoinIcon size={18} />
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  color: '#5D4037',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {wallet.coins}
              </span>
            </div>

            {/* Cápsula de Cash */}
            <div
              title={`Playfish Cash: ${wallet.cash}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(232, 245, 233, 0.9)',
                border: '1.5px solid #81C784',
                borderRadius: theme.borderRadius.pill,
                padding: '2px 7px 2px 4px',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 2px 4px rgba(60,40,20,0.12)',
              }}
            >
              <PlayfishCashIcon size={19} />
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  color: '#1B5E20',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {wallet.cash}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fila 2: Cuadrícula 2x2 de Mini-Barras de Necesidades */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px 10px',
        }}
      >
        {needsConfig.map((item) => (
          <CompactNeedBar
            key={item.id}
            label={item.label}
            icon={item.icon}
            value={item.value}
            normalGradient={item.normalGradient}
            criticalGradient={item.criticalGradient}
          />
        ))}
      </div>
    </aside>
  );
};
