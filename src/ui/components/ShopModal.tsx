import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Wallet } from '../../domain';
import type { ShopCategory, ShopItem } from '../../domain/shop';
import { SHOP_CATALOG } from '../../domain/shop';
import { canAfford } from '../../domain/economy';
import { theme } from '../../styles';

export type ShopFilterCategory = 'all' | ShopCategory;

export interface ShopModalProps {
  readonly isOpen: boolean;
  readonly wallet: Wallet;
  readonly onClose: () => void;
  readonly onBuyItem: (
    shopItemId: string,
    quantity?: number
  ) => { success: boolean; error?: string };
  readonly catalog?: readonly ShopItem[];
}

const CATEGORY_TABS: readonly { readonly id: ShopFilterCategory; readonly label: string; readonly icon: string }[] = [
  { id: 'all', label: 'Todos', icon: '🛍️' },
  { id: 'food', label: 'Comida', icon: '🍎' },
  { id: 'clothes', label: 'Ropa', icon: '👕' },
  { id: 'furniture', label: 'Muebles', icon: '🛋️' },
];

/**
 * Modal accesible y temático para la Tienda de Ítems de Pet Society (T-08).
 *
 * Responsabilidades:
 * - Mostrar el catálogo de productos categorizados (Comida, Ropa, Muebles).
 * - Indicar precios claros en Monedas y Cash junto con el saldo actual del jugador.
 * - Habilitar/deshabilitar compras según solvencia económica.
 * - Brindar retroalimentación visual inmediata tras cada intento de compra.
 * - Soportar navegación por teclado (Escape para cerrar, foco accesible).
 */
export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  wallet,
  onClose,
  onBuyItem,
  catalog = SHOP_CATALOG,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ShopFilterCategory>('all');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // Limpiar timeout de feedback al desmontar
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  // Soporte para cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const showLocalFeedback = useCallback((message: string, isError: boolean = false) => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    setFeedback({ message, isError });
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
      feedbackTimeoutRef.current = null;
    }, 2800);
  }, []);

  const handleBuy = useCallback(
    (item: ShopItem) => {
      const result = onBuyItem(item.id, 1);
      if (result.success) {
        showLocalFeedback(`¡Compraste ${item.name}! Guardado en tu inventario ✨`, false);
      } else {
        if (result.error === 'INSUFFICIENT_FUNDS') {
          showLocalFeedback(`No tienes suficiente saldo para comprar ${item.name}.`, true);
        } else {
          showLocalFeedback(`No se pudo comprar el ítem seleccionado.`, true);
        }
      }
    },
    [onBuyItem, showLocalFeedback]
  );

  if (!isOpen) {
    return null;
  }

  const filteredItems = catalog.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tienda de Pet Society"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: theme.colors.modalOverlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: theme.spacing.medium,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '88vh',
          backgroundColor: theme.colors.cardBackground,
          borderRadius: theme.borderRadius.large,
          border: `1px solid ${theme.colors.cardBorder}`,
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Cabecera de la Tienda */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: `${theme.spacing.medium} ${theme.spacing.large}`,
            backgroundColor: theme.colors.primary,
            color: '#FFFFFF',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
            <span style={{ fontSize: '1.4rem' }} aria-hidden="true">
              🏪
            </span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                }}
              >
                Tienda de Pet Society
              </h2>
              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                ¡Consiente a tu mascota con delicias, ropa y muebles!
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tienda"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: theme.borderRadius.round,
              width: '32px',
              height: '32px',
              fontSize: '1.1rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
          >
            ✕
          </button>
        </header>

        {/* Barra de Saldo y Pestañas de Categoría */}
        <div
          style={{
            padding: `${theme.spacing.small} ${theme.spacing.large}`,
            backgroundColor: theme.colors.background,
            borderBottom: `1px solid ${theme.colors.cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: theme.spacing.small,
            flexShrink: 0,
          }}
        >
          {/* Pestañas de Categoría */}
          <nav aria-label="Filtro de categorías" style={{ display: 'flex', gap: theme.spacing.xs }}>
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  style={{
                    backgroundColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.cardBackground,
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                    border: `1px solid ${
                      isSelected ? theme.colors.primaryDark : theme.colors.cardBorder
                    }`,
                    borderRadius: theme.borderRadius.pill,
                    padding: `${theme.spacing.xs} ${theme.spacing.small}`,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Saldo actual del jugador */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.medium,
              backgroundColor: theme.colors.cardBackground,
              padding: `4px ${theme.spacing.medium}`,
              borderRadius: theme.borderRadius.pill,
              border: `1px solid ${theme.colors.cardBorder}`,
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            <span
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              title="Tus monedas disponibles"
            >
              <span aria-hidden="true">🪙</span>
              <span style={{ color: theme.colors.text }}>{wallet.coins}</span>
            </span>
            <span
              style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              title="Tu cash disponible"
            >
              <span aria-hidden="true">💵</span>
              <span style={{ color: theme.colors.text }}>{wallet.cash}</span>
            </span>
          </div>
        </div>

        {/* Notificación de feedback local (al comprar o al faltar saldo) */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            style={{
              backgroundColor: feedback.isError ? theme.colors.danger : theme.colors.primaryDark,
              color: '#FFFFFF',
              padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'center',
              animation: 'fadeIn 0.2s ease-in-out',
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Catálogo de Productos (Grid responsivo con scroll) */}
        <div
          role="list"
          style={{
            padding: theme.spacing.large,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: theme.spacing.medium,
            alignContent: 'start',
            flex: 1,
          }}
        >
          {filteredItems.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: theme.spacing.xlarge,
                color: theme.colors.textMuted,
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: theme.spacing.small }}>📦</div>
              <p style={{ margin: 0, fontWeight: 'bold' }}>No hay productos en esta categoría</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const affordable = canAfford(wallet, item.price);
              const isCashPrice = item.price.cash !== undefined && item.price.cash > 0;
              const priceText = isCashPrice
                ? `${item.price.cash} Cash`
                : `${item.price.coins} Monedas`;
              const priceIcon = isCashPrice ? '💵' : '🪙';

              return (
                <div
                  key={item.id}
                  role="listitem"
                  style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: theme.borderRadius.medium,
                    border: `1px solid ${theme.colors.cardBorder}`,
                    padding: theme.spacing.medium,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: theme.spacing.small,
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  {/* Contenedor del Icono */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: theme.borderRadius.large,
                      backgroundColor: theme.colors.cardBackground,
                      border: `1px solid ${theme.colors.cardBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>

                  {/* Información del Ítem */}
                  <div style={{ flex: 1, width: '100%' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        color: theme.colors.text,
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* Insignia de detalle según categoría */}
                    <div style={{ margin: `${theme.spacing.xs} 0` }}>
                      {item.category === 'food' && item.nutrition && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: theme.colors.tagBackground,
                            color: theme.colors.tagText,
                            padding: '2px 6px',
                            borderRadius: theme.borderRadius.pill,
                            fontWeight: 600,
                          }}
                        >
                          {`+${item.nutrition} Saciedad`}
                        </span>
                      )}
                      {item.category === 'clothes' && item.clothingSlot && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#E3F2FD',
                            color: '#1565C0',
                            padding: '2px 6px',
                            borderRadius: theme.borderRadius.pill,
                            fontWeight: 600,
                          }}
                        >
                          {item.clothingSlot === 'hat'
                            ? 'Sombrero'
                            : item.clothingSlot === 'shirt'
                            ? 'Camiseta'
                            : 'Accesorio'}
                        </span>
                      )}
                      {item.category === 'furniture' && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#FFF3E0',
                            color: '#E65100',
                            padding: '2px 6px',
                            borderRadius: theme.borderRadius.pill,
                            fontWeight: 600,
                          }}
                        >
                          Mueble de Sala
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: theme.colors.textMuted,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2rem',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Precio y Botón de Compra */}
                  <div
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: theme.spacing.xs,
                      marginTop: theme.spacing.xs,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: isCashPrice ? theme.colors.cashGreen : theme.colors.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <span aria-hidden="true">{priceIcon}</span>
                      <span>{priceText}</span>
                    </div>

                    <button
                      type="button"
                      disabled={!affordable}
                      onClick={() => handleBuy(item)}
                      aria-label={`Comprar ${item.name} por ${priceText}`}
                      style={{
                        width: '100%',
                        backgroundColor: affordable
                          ? isCashPrice
                            ? theme.colors.cashGreen
                            : theme.colors.primary
                          : theme.colors.inactiveOption,
                        color: affordable ? '#FFFFFF' : theme.colors.textMuted,
                        border: `1px solid ${
                          affordable
                            ? isCashPrice
                              ? '#1B5E20'
                              : theme.colors.primaryDark
                            : theme.colors.cardBorder
                        }`,
                        borderRadius: theme.borderRadius.pill,
                        padding: `${theme.spacing.xs} ${theme.spacing.small}`,
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        cursor: affordable ? 'pointer' : 'not-allowed',
                        boxShadow: affordable ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {affordable ? 'Comprar' : 'Sin saldo'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
