import React from 'react';
import type { PetNeeds, Wallet } from '../../domain';
import { theme } from '../../styles';
import { getNeedSemanticColor } from './needColors';

export interface NeedsHUDProps {
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
}

/**
 * Barra individual de progreso para una necesidad (R-07: Componentes Aislados).
 */
const NeedBar: React.FC<{
  readonly label: string;
  readonly icon: string;
  readonly value: number;
}> = ({ label, icon, value }) => {
  const roundedValue = Math.round(Math.max(0, Math.min(100, value)));
  const fillColor = getNeedSemanticColor(roundedValue);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xs,
        flex: 1,
        minWidth: '110px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: theme.colors.text,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
          <span aria-hidden="true">{icon}</span>
          <span>{label}</span>
        </span>
        <span style={{ color: theme.colors.textMuted }}>{roundedValue}%</span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={roundedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: theme.colors.barBackground,
          borderRadius: theme.borderRadius.pill,
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            width: `${roundedValue}%`,
            height: '100%',
            backgroundColor: fillColor,
            borderRadius: theme.borderRadius.pill,
            transition: 'width 0.4s ease-out, background-color 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};

/**
 * Componente HUD que muestra la información de la mascota, su billetera y
 * las 4 barras de necesidades vitales con semántica visual.
 */
export const NeedsHUD: React.FC<NeedsHUDProps> = ({
  petName,
  level,
  needs,
  wallet,
}) => {
  const needsConfig: readonly NeedItemConfig[] = [
    { id: 'hunger', label: 'Hambre', icon: '🍗', value: needs.hunger },
    { id: 'hygiene', label: 'Higiene', icon: '🧼', value: needs.hygiene },
    { id: 'energy', label: 'Energía', icon: '⚡', value: needs.energy },
    { id: 'happiness', label: 'Felicidad', icon: '❤️', value: needs.happiness },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.small,
        backgroundColor: theme.colors.hudBackground,
        padding: `${theme.spacing.small} ${theme.spacing.medium}`,
        borderRadius: theme.borderRadius.medium,
        boxShadow: theme.colors.hudShadow,
        border: `1px solid ${theme.colors.hudBorder}`,
        fontFamily: 'sans-serif',
        userSelect: 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Fila superior: Nombre de la mascota, Nivel y Billetera */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: theme.spacing.small,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: theme.colors.text }}>
            {petName}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: theme.colors.primary,
              color: '#FFFFFF',
              padding: `2px ${theme.spacing.small}`,
              borderRadius: theme.borderRadius.pill,
              fontWeight: 600,
            }}
          >
            Nvl {level}
          </span>
        </div>

        {wallet && (
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.medium, fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, fontWeight: 'bold', color: theme.colors.text }}>
              <span aria-hidden="true">🪙</span>
              <span>{wallet.coins}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, fontWeight: 'bold', color: theme.colors.text }}>
              <span aria-hidden="true">💵</span>
              <span>{wallet.cash}</span>
            </span>
          </div>
        )}
      </div>

      {/* Fila inferior: 4 Barras de Necesidades */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: theme.spacing.small,
        }}
      >
        {needsConfig.map((item) => (
          <NeedBar
            key={item.id}
            label={item.label}
            icon={item.icon}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
};
