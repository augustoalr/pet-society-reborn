import React from 'react';
import type { Inventory, InventoryItem } from '../../domain';
import { DEFAULT_FOOD_NUTRITION } from '../../domain';
import { theme } from '../../styles';

export interface FoodSelectorModalProps {
  readonly isOpen: boolean;
  readonly inventory: Inventory;
  readonly onClose: () => void;
  readonly onSelectFood: (item: InventoryItem) => void;
  readonly onOpenShop?: () => void;
}

function getFoodItemIcon(itemId: string): string {
  if (itemId.includes('bread')) return '🍞';
  if (itemId.includes('cookie')) return '🍪';
  if (itemId.includes('sushi')) return '🍣';
  if (itemId.includes('cake')) return '🍰';
  if (itemId.includes('golden')) return '🌟';
  return '🍎';
}

/**
 * Modal accesible y responsivo para seleccionar alimentos del inventario (R-07, R-08).
 */
export const FoodSelectorModal: React.FC<FoodSelectorModalProps> = ({
  isOpen,
  inventory,
  onClose,
  onSelectFood,
  onOpenShop,
}) => {
  if (!isOpen) {
    return null;
  }

  const foodItems = inventory.items.filter(
    (item) => item.category === 'food' && item.quantity > 0
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Seleccionar comida"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.colors.modalOverlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: theme.spacing.medium,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: theme.colors.cardBackground,
          borderRadius: theme.borderRadius.large,
          border: `1px solid ${theme.colors.cardBorder}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Cabecera del modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${theme.spacing.medium} ${theme.spacing.large}`,
            borderBottom: `1px solid ${theme.colors.cardBorder}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
              🍎
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: '1.1rem',
                color: theme.colors.text,
                fontWeight: 'bold',
              }}
            >
              Dar de Comer
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: theme.colors.textMuted,
              padding: theme.spacing.xs,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Lista de alimentos o Estado Vacío (R-08: Resiliencia Visual) */}
        <div
          style={{
            padding: theme.spacing.medium,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.small,
          }}
        >
          {foodItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing.large,
                color: theme.colors.textMuted,
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: theme.spacing.small }} aria-hidden="true">
                🥣
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>
                ¡Tu despensa está vacía!
              </p>
              <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: '0.8rem' }}>
                Visita la tienda para comprar más delicias.
              </p>
              {onOpenShop && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenShop();
                  }}
                  style={{
                    marginTop: theme.spacing.medium,
                    backgroundColor: theme.colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: theme.borderRadius.pill,
                    padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Ir a la Tienda 🏪
                </button>
              )}
            </div>
          ) : (
            foodItems.map((food) => {
              const nutrition = food.nutrition ?? DEFAULT_FOOD_NUTRITION;
              const icon = getFoodItemIcon(food.id);

              return (
                <div
                  key={food.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: theme.spacing.small,
                    border: `1px solid ${theme.colors.cardBorder}`,
                    borderRadius: theme.borderRadius.medium,
                    backgroundColor: theme.colors.background,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
                    <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
                      {icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: theme.colors.text }}>
                        {food.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: theme.colors.primaryDark,
                          fontWeight: 600,
                        }}
                      >
                        +{nutrition} Hambre · x{food.quantity}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectFood(food);
                      onClose();
                    }}
                    style={{
                      backgroundColor: theme.colors.primary,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: theme.borderRadius.small,
                      padding: `${theme.spacing.small} ${theme.spacing.medium}`,
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    Dar
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
