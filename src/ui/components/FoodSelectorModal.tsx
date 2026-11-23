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
  /** Callback para bañar a la mascota directamente desde los cuidados */
  readonly onClean?: () => void;
  /** Callback para acariciar a la mascota */
  readonly onPet?: () => void;
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
 * Modal accesible y responsivo para el baúl de alimentos y cuidados estilo Flash (T-UI-OVERHAUL).
 */
export const FoodSelectorModal: React.FC<FoodSelectorModalProps> = ({
  isOpen,
  inventory,
  onClose,
  onSelectFood,
  onOpenShop,
  onClean,
  onPet,
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
      aria-label="Baúl de alimentos y cuidados"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 20, 10, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: theme.spacing.medium,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 60%, #F5E8D3 100%)',
          borderRadius: theme.borderRadius.xlarge,
          border: '3px solid #8C6A43',
          boxShadow: '0 12px 36px rgba(45, 25, 10, 0.4), inset 0 2px 0 rgba(255,255,255,0.9)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '82vh',
          overflow: 'hidden',
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {/* Cabecera del modal */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${theme.spacing.medium} ${theme.spacing.large}`,
            borderBottom: '2px solid rgba(140, 106, 67, 0.25)',
            background: 'linear-gradient(180deg, #FFF8E7 0%, #F3E5D0 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
            <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
              📦
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: '1.15rem',
                color: '#3E2723',
                fontWeight: 900,
                textShadow: '0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              Baúl de Alimentos y Cuidados
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: theme.borderRadius.round,
              border: '2px solid #5D4037',
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              fontSize: '1rem',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 0 #5D4037',
              transition: 'transform 0.1s',
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1px)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Acciones Rápidas de Higiene y Mimo */}
        {(onClean || onPet) && (
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.small,
              padding: `${theme.spacing.small} ${theme.spacing.medium}`,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              borderBottom: '1px solid rgba(140, 106, 67, 0.2)',
            }}
          >
            {onClean && (
              <button
                type="button"
                onClick={onClean}
                aria-label="Bañar mascota con jabón"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: theme.borderRadius.pill,
                  border: '2px solid #0277BD',
                  background: 'linear-gradient(180deg, #E1F5FE 0%, #B3E5FC 100%)',
                  color: '#01579B',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #0277BD, 0 3px 6px rgba(0,0,0,0.1)',
                }}
              >
                <span aria-hidden="true">🧼</span>
                <span>Bañar con Jabón</span>
              </button>
            )}

            {onPet && (
              <button
                type="button"
                onClick={onPet}
                aria-label="Acariciar mascota"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: theme.borderRadius.pill,
                  border: '2px solid #C2185B',
                  background: 'linear-gradient(180deg, #FCE4EC 0%, #F8BBD0 100%)',
                  color: '#880E4F',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #C2185B, 0 3px 6px rgba(0,0,0,0.1)',
                }}
              >
                <span aria-hidden="true">❤️</span>
                <span>Acariciar</span>
              </button>
            )}
          </div>
        )}

        {/* Lista de alimentos o Estado Vacío */}
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
              <div style={{ fontSize: '2.5rem', marginBottom: theme.spacing.small }} aria-hidden="true">
                🥣
              </div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#4E342E' }}>
                ¡Tu despensa está vacía!
              </p>
              <p style={{ margin: `${theme.spacing.xs} 0 0`, fontSize: '0.85rem' }}>
                Visita la tienda para comprar más alimentos deliciosos.
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
                    backgroundColor: '#FB8C00',
                    color: '#FFFFFF',
                    border: '2px solid #E65100',
                    borderRadius: theme.borderRadius.pill,
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 3px 0 #E65100',
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
                    padding: `${theme.spacing.small} ${theme.spacing.medium}`,
                    border: '1.5px solid rgba(140, 106, 67, 0.3)',
                    borderRadius: theme.borderRadius.large,
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 2px 4px rgba(60,40,20,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
                    <span style={{ fontSize: '1.6rem', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))' }} aria-hidden="true">
                      {icon}
                    </span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#3E2723' }}>
                        {food.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#2E7D32',
                          fontWeight: 700,
                        }}
                      >
                        +{nutrition} Hambre · x{food.quantity} disponibles
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
                      backgroundColor: '#4CAF50',
                      color: '#FFFFFF',
                      border: '2px solid #2E7D32',
                      borderRadius: theme.borderRadius.pill,
                      padding: '6px 16px',
                      fontWeight: 900,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 3px 0 #2E7D32, 0 3px 6px rgba(0,0,0,0.15)',
                      transition: 'transform 0.1s',
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translateY(2px)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Dar 🍎
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
