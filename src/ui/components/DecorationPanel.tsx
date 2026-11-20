import React, { useState } from 'react';
import type { Inventory, Room } from '../../domain';
import { BASE_FURNITURE_CATALOG } from '../../game';
import { theme } from '../../styles';

export interface DecorationPanelProps {
  readonly inventory: Inventory;
  readonly room: Room;
  readonly selectedItemId: string | null;
  readonly onPlaceItem: (itemId: string) => void;
  readonly onRemoveItem: (itemId: string) => void;
  readonly onSelectPlacedItem: (itemId: string | null) => void;
}

/**
 * Obtiene un emoji descriptivo según el tipo de mueble.
 */
function getFurnitureIcon(itemId: string): string {
  if (itemId.includes('bed')) return '🛏️';
  if (itemId.includes('table')) return '🪵';
  if (itemId.includes('lamp')) return '💡';
  if (itemId.includes('plant')) return '🪴';
  return '📦';
}

/**
 * Obtiene el nombre amigable de un ítem según el catálogo o su ID.
 */
function getFurnitureName(itemId: string): string {
  const definition = BASE_FURNITURE_CATALOG.find(
    (f) => f.id === itemId || itemId.startsWith(f.id)
  );
  return definition?.name ?? itemId;
}

/**
 * Panel interactivo para el modo de decoración de la habitación.
 *
 * Permite visualizar el baúl de muebles disponibles en el inventario,
 * colocarlos en la sala, o retirarlos de la habitación y guardarlos en el baúl.
 */
export const DecorationPanel: React.FC<DecorationPanelProps> = ({
  inventory,
  room,
  selectedItemId,
  onPlaceItem,
  onRemoveItem,
  onSelectPlacedItem,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'placed'>('inventory');

  const availableFurniture = inventory.items.filter(
    (item) => item.category === 'furniture' && item.quantity > 0
  );
  const placedFurniture = room.placedItems;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.small,
        width: '100%',
        maxWidth: '700px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Selector de sub-pestañas: Baúl vs Colocados */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.small,
          borderBottom: `1px solid ${theme.colors.cardBorder}`,
          paddingBottom: theme.spacing.xs,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: theme.spacing.small }}>
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
              backgroundColor:
                activeTab === 'inventory'
                  ? theme.colors.activeOption
                  : theme.colors.inactiveOption,
              color:
                activeTab === 'inventory'
                  ? theme.colors.activeOptionText
                  : theme.colors.inactiveOptionText,
              border: 'none',
              borderRadius: theme.borderRadius.small,
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
            }}
          >
            <span>🧰 Baúl de Muebles</span>
            <span
              style={{
                backgroundColor: 'rgba(0,0,0,0.15)',
                padding: '2px 6px',
                borderRadius: theme.borderRadius.pill,
                fontSize: '0.75rem',
              }}
            >
              {availableFurniture.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('placed')}
            style={{
              padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
              backgroundColor:
                activeTab === 'placed'
                  ? theme.colors.activeOption
                  : theme.colors.inactiveOption,
              color:
                activeTab === 'placed'
                  ? theme.colors.activeOptionText
                  : theme.colors.inactiveOptionText,
              border: 'none',
              borderRadius: theme.borderRadius.small,
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
            }}
          >
            <span>🛋️ En Habitación</span>
            <span
              style={{
                backgroundColor: 'rgba(0,0,0,0.15)',
                padding: '2px 6px',
                borderRadius: theme.borderRadius.pill,
                fontSize: '0.75rem',
              }}
            >
              {placedFurniture.length}
            </span>
          </button>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: theme.colors.textMuted,
            fontStyle: 'italic',
          }}
        >
          💡 Arrastra los muebles en la sala para reacomodarlos
        </span>
      </div>

      {/* Contenido: Baúl de muebles en inventario */}
      {activeTab === 'inventory' && (
        <div
          style={{
            maxHeight: '140px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.xs,
          }}
        >
          {availableFurniture.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing.medium,
                color: theme.colors.textMuted,
                fontSize: '0.9rem',
              }}
            >
              No tienes muebles en tu baúl. Si colocaste todos, puedes retirarlos en la pestaña &ldquo;En Habitación&rdquo;.
            </div>
          ) : (
            availableFurniture.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${theme.spacing.xs} ${theme.spacing.small}`,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.small,
                  border: `1px solid ${theme.colors.cardBorder}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.small }}>
                  <span style={{ fontSize: '1.3rem' }}>{getFurnitureIcon(item.id)}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                      Cantidad disponible: x{item.quantity}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onPlaceItem(item.id)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: theme.borderRadius.small,
                    padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                  }}
                >
                  <span>Colocar en Sala</span>
                  <span>➕</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contenido: Muebles colocados en la habitación */}
      {activeTab === 'placed' && (
        <div
          style={{
            maxHeight: '140px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.xs,
          }}
        >
          {placedFurniture.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing.medium,
                color: theme.colors.textMuted,
                fontSize: '0.9rem',
              }}
            >
              La habitación está vacía. ¡Elige muebles de tu baúl para comenzar a decorar!
            </div>
          ) : (
            placedFurniture.map((placed) => {
              const isSelected = selectedItemId === placed.itemId;

              return (
                <div
                  key={placed.itemId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${theme.spacing.xs} ${theme.spacing.small}`,
                    backgroundColor: isSelected ? '#E8F5E9' : theme.colors.background,
                    borderRadius: theme.borderRadius.small,
                    border: `1.5px solid ${isSelected ? theme.colors.primary : theme.colors.cardBorder}`,
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      onSelectPlacedItem(isSelected ? null : placed.itemId)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelectPlacedItem(isSelected ? null : placed.itemId);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.small,
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: '1.3rem' }}>{getFurnitureIcon(placed.itemId)}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {getFurnitureName(placed.itemId)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme.colors.textMuted }}>
                        Posición: ({Math.round(placed.x)}, {Math.round(placed.y)})
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectPlacedItem(isSelected ? null : placed.itemId)
                      }
                      style={{
                        backgroundColor: isSelected
                          ? theme.colors.primaryDark
                          : theme.colors.inactiveOption,
                        color: isSelected ? '#FFFFFF' : theme.colors.text,
                        border: 'none',
                        borderRadius: theme.borderRadius.small,
                        padding: `${theme.spacing.xs} ${theme.spacing.small}`,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      {isSelected ? '✓ Seleccionado' : 'Seleccionar'}
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(placed.itemId)}
                      title="Guardar de vuelta en el baúl"
                      style={{
                        backgroundColor: '#FFEBEE',
                        color: '#D32F2F',
                        border: '1px solid #FFCDD2',
                        borderRadius: theme.borderRadius.small,
                        padding: `${theme.spacing.xs} ${theme.spacing.small}`,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      Guardar 📦
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
