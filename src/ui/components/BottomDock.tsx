import React from 'react';
import { theme } from '../../styles';

export interface BottomDockProps {
  /** Abre el modal de la tienda de ítems (Puerta) */
  readonly onOpenShop: () => void;
  /** Abre el baúl/despensa de alimentos y cuidados (Baúl) */
  readonly onOpenChest: () => void;
  /** Alterna el vestidor y personalizador de ropa/aspecto (Armario) */
  readonly onToggleWardrobe: () => void;
  /** Alterna el modo de decoración de la habitación (Herramienta) */
  readonly onToggleDecorate: () => void;
  /** Alterna entre la habitación y el jardín exterior de minijuego (Pelota) */
  readonly onToggleMinigame: () => void;
  /** Si el panel de armario está activo actualmente */
  readonly isWardrobeActive?: boolean;
  /** Si el modo decoración está activo actualmente */
  readonly isDecorateActive?: boolean;
  /** Si la vista actual es el minijuego de pelota */
  readonly isMinigameActive?: boolean;
  /** Cantidad de comida disponible para el badge del baúl */
  readonly foodCount?: number;
}

interface DockButtonConfig {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly ariaLabel: string;
  readonly onClick: () => void;
  readonly isActive?: boolean;
  readonly badge?: number | string;
  readonly gradient: string;
  readonly glowColor: string;
}

/**
 * Botón circular estilo Flash con relieve 3D, borde oscuro y efecto elástico al pulsar.
 */
const DockCircleButton: React.FC<DockButtonConfig> = ({
  label,
  icon,
  ariaLabel,
  onClick,
  isActive = false,
  badge,
  gradient,
  glowColor,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        position: 'relative',
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isActive}
        onClick={onClick}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: theme.borderRadius.round,
          border: `3px solid ${theme.colors.flashBezel}`,
          background: gradient,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: 0,
          outline: 'none',
          boxShadow: isActive
            ? `0 0 0 3px #FFFFFF, 0 0 0 5.5px ${glowColor}, 0 6px 0 ${theme.colors.flashBezel}, 0 8px 14px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.7)`
            : `0 5px 0 ${theme.colors.flashBezel}, 0 7px 12px rgba(0,0,0,0.28), inset 0 3px 0 rgba(255,255,255,0.65)`,
          transform: isActive ? 'translateY(1px)' : 'translateY(0)',
          transition: `transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.08)';
          e.currentTarget.style.boxShadow = isActive
            ? `0 0 0 3px #FFFFFF, 0 0 0 6px ${glowColor}, 0 8px 0 ${theme.colors.flashBezel}, 0 12px 18px rgba(0,0,0,0.4), inset 0 3px 0 rgba(255,255,255,0.8)`
            : `0 8px 0 ${theme.colors.flashBezel}, 0 11px 16px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.75)`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isActive ? 'translateY(1px)' : 'translateY(0)';
          e.currentTarget.style.boxShadow = isActive
            ? `0 0 0 3px #FFFFFF, 0 0 0 5.5px ${glowColor}, 0 6px 0 ${theme.colors.flashBezel}, 0 8px 14px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.7)`
            : `0 5px 0 ${theme.colors.flashBezel}, 0 7px 12px rgba(0,0,0,0.28), inset 0 3px 0 rgba(255,255,255,0.65)`;
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(3px) scale(0.96)';
          e.currentTarget.style.boxShadow = `0 2px 0 ${theme.colors.flashBezel}, 0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)`;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)';
        }}
      >
        {/* Reflejo semicircular superior estilo botón de gominola Flash */}
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: '6px',
            right: '6px',
            height: '24px',
            borderRadius: '24px 24px 14px 14px',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.1) 85%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Icono central */}
        <span
          style={{
            fontSize: '1.75rem',
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.25))',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          {icon}
        </span>

        {/* Badge numérico para contador (e.g. comida en el baúl) */}
        {badge !== undefined && badge !== 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#E53935',
              color: '#FFFFFF',
              border: '2px solid #FFFFFF',
              borderRadius: theme.borderRadius.pill,
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '1px 6px',
              minWidth: '18px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
            }}
          >
            {badge}
          </span>
        )}
      </button>

      {/* Etiqueta amigable redondeada debajo del botón */}
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#4E342E',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(140, 106, 67, 0.4)',
          borderRadius: theme.borderRadius.pill,
          padding: '1px 7px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Dock Flotante Inferior de Acciones Estilo Pet Society Flash (Playfish 2008-2013).
 *
 * Contiene los 5 botones circulares canónicos:
 * 1. 🚪 Puerta: Abre el modal de Tienda de ítems (ShopModal).
 * 2. 📦 Baúl: Abre el modal de Alimentos y Cuidados (FoodSelectorModal).
 * 3. 👗 Armario: Abre el vestidor/personalizador de mascota (PetCustomizer).
 * 4. 🔨 Herramienta: Alterna el modo Decorar Habitación (DecorationPanel y rejilla).
 * 5. ⚽ Pelota: Alterna entre la Habitación y el Jardín Exterior de malabares.
 */
export const BottomDock: React.FC<BottomDockProps> = ({
  onOpenShop,
  onOpenChest,
  onToggleWardrobe,
  onToggleDecorate,
  onToggleMinigame,
  isWardrobeActive = false,
  isDecorateActive = false,
  isMinigameActive = false,
  foodCount,
}) => {
  const dockButtons: readonly DockButtonConfig[] = [
    {
      id: 'shop',
      label: 'Tiendas',
      icon: '🚪',
      ariaLabel: 'Abrir Tiendas y Ciudad',
      onClick: onOpenShop,
      gradient: 'linear-gradient(180deg, #FFA726 0%, #FB8C00 60%, #E65100 100%)',
      glowColor: '#FF9800',
    },
    {
      id: 'chest',
      label: 'Baúl',
      icon: '📦',
      ariaLabel: 'Abrir Baúl de Alimentos y Cuidados',
      onClick: onOpenChest,
      badge: foodCount,
      gradient: 'linear-gradient(180deg, #4FC3F7 0%, #039BE5 60%, #0277BD 100%)',
      glowColor: '#03A9F4',
    },
    {
      id: 'wardrobe',
      label: 'Armario',
      icon: '👗',
      ariaLabel: 'Abrir Armario y Vestidor de Ropa',
      onClick: onToggleWardrobe,
      isActive: isWardrobeActive,
      gradient: 'linear-gradient(180deg, #F48FB1 0%, #E91E63 60%, #C2185B 100%)',
      glowColor: '#E91E63',
    },
    {
      id: 'decorate',
      label: isDecorateActive ? 'Listo ✓' : 'Decorar',
      icon: isDecorateActive ? '🛋️' : '🔨',
      ariaLabel: isDecorateActive ? 'Finalizar Decoración' : 'Activar Modo Decorar Habitación',
      onClick: onToggleDecorate,
      isActive: isDecorateActive,
      gradient: isDecorateActive
        ? 'linear-gradient(180deg, #C8E6C9 0%, #4CAF50 60%, #2E7D32 100%)'
        : 'linear-gradient(180deg, #A5D6A7 0%, #66BB6A 60%, #388E3C 100%)',
      glowColor: '#4CAF50',
    },
    {
      id: 'minigame',
      label: isMinigameActive ? 'Casa' : 'Jardín',
      icon: isMinigameActive ? '🏠' : '⚽',
      ariaLabel: isMinigameActive ? 'Volver a la Habitación' : 'Ir al Jardín a Jugar con Pelota',
      onClick: onToggleMinigame,
      isActive: isMinigameActive,
      gradient: isMinigameActive
        ? 'linear-gradient(180deg, #FFE082 0%, #FFB300 60%, #FF8F00 100%)'
        : 'linear-gradient(180deg, #CE93D8 0%, #AB47BC 60%, #7B1FA2 100%)',
      glowColor: '#BA68C8',
    },
  ];

  return (
    <nav
      aria-label="Barra de navegación y acciones de juego"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        background: theme.colors.flashDockBackground,
        border: theme.colors.flashDockBorder,
        borderRadius: theme.borderRadius.pill,
        boxShadow: theme.colors.flashDockShadow,
        padding: '10px 18px',
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
    >
      {dockButtons.map((btn) => (
        <DockCircleButton key={btn.id} {...btn} />
      ))}
    </nav>
  );
};
