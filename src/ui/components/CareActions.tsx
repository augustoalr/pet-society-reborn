import React from 'react';
import { theme } from '../../styles';

export interface CareActionsProps {
  readonly onOpenFoodModal: () => void;
  readonly onClean: () => void;
  readonly onPet: () => void;
  readonly foodCount: number;
}

/**
 * Barra de herramientas interactiva para los cuidados de la mascota (R-07).
 */
export const CareActions: React.FC<CareActionsProps> = ({
  onOpenFoodModal,
  onClean,
  onPet,
  foodCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.small,
        flexWrap: 'wrap',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Botón Alimentar */}
      <button
        type="button"
        onClick={onOpenFoodModal}
        aria-label="Alimentar mascota"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.xs,
          backgroundColor: theme.colors.actionButtonBackground,
          border: `1px solid ${theme.colors.actionButtonBorder}`,
          borderRadius: theme.borderRadius.pill,
          padding: `${theme.spacing.small} ${theme.spacing.medium}`,
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: theme.colors.text,
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          transition: 'transform 0.1s, background-color 0.2s',
        }}
      >
        <span aria-hidden="true">🍎</span>
        <span>Alimentar</span>
        <span
          style={{
            backgroundColor: foodCount > 0 ? theme.colors.primary : theme.colors.textMuted,
            color: '#FFFFFF',
            fontSize: '0.7rem',
            padding: '2px 6px',
            borderRadius: theme.borderRadius.pill,
          }}
        >
          {foodCount}
        </span>
      </button>

      {/* Botón Jabón / Esponja */}
      <button
        type="button"
        onClick={onClean}
        aria-label="Bañar mascota con jabón"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.xs,
          backgroundColor: theme.colors.actionButtonBackground,
          border: `1px solid ${theme.colors.actionButtonBorder}`,
          borderRadius: theme.borderRadius.pill,
          padding: `${theme.spacing.small} ${theme.spacing.medium}`,
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: theme.colors.text,
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          transition: 'transform 0.1s, background-color 0.2s',
        }}
      >
        <span aria-hidden="true">🧼</span>
        <span>Jabón</span>
      </button>

      {/* Botón Acariciar */}
      <button
        type="button"
        onClick={onPet}
        aria-label="Acariciar mascota"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.xs,
          backgroundColor: theme.colors.actionButtonBackground,
          border: `1px solid ${theme.colors.actionButtonBorder}`,
          borderRadius: theme.borderRadius.pill,
          padding: `${theme.spacing.small} ${theme.spacing.medium}`,
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: theme.colors.text,
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
          transition: 'transform 0.1s, background-color 0.2s',
        }}
      >
        <span aria-hidden="true">❤️</span>
        <span>Acariciar</span>
      </button>
    </div>
  );
};
