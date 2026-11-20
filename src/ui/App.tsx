import React, { useState } from 'react';
import { usePetCare } from '../infrastructure';
import { theme } from '../styles';
import {
  GameCanvas,
  PetCustomizer,
  NeedsHUD,
  CareActions,
  FoodSelectorModal,
  DecorationPanel,
  ShopModal,
} from './components';

/**
 * Componente raíz de la aplicación Pet Society (Reborn).
 *
 * Estructura de la interfaz:
 * - HUD superior: Muestra estado vital de la mascota (Hambre, Higiene, Energía, Felicidad) y billetera.
 * - Lienzo de juego (PixiJS): Habitación procedimental 2D, muebles interactivos y mascota por capas.
 * - Barra flotante de acciones rápidas de cuidado: Alimentar, Jabón y Acariciar.
 * - Modal de selección de comida del inventario.
 * - Panel inferior con selector de modo:
 *   - 'care': Cuidados rápidos.
 *   - 'customize': Personalizador de aspecto y ropa (T-04).
 *   - 'decorate': Modo Decoración para colocar y reacomodar muebles en la sala (T-07).
 */
export const App: React.FC = () => {
  const {
    gameState,
    isLoading,
    feedbackMessage,
    feed,
    clean,
    pet,
    updateAppearance,
    updateClothes,
    placeFurniture,
    moveFurniture,
    removeFurniture,
    buyItem,
  } = usePetCare();

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'care' | 'customize' | 'decorate'>('care');
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);

  if (isLoading || !gameState) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.gameContainerBackground,
          color: theme.colors.loadingText,
          fontFamily: 'sans-serif',
          fontSize: '1.2rem',
        }}
      >
        Cargando partida y mascota…
      </div>
    );
  }

  const { pet: currentPet, inventory, wallet, room } = gameState;
  const foodCount = inventory.items
    .filter((item) => item.category === 'food')
    .reduce((total, item) => total + item.quantity, 0);

  return (
    <div
      style={{
        width: '100vw',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: theme.colors.gameContainerBackground,
        margin: 0,
        padding: 0,
      }}
    >
      {/* Encabezado superior */}
      <header
        style={{
          flexShrink: 0,
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `0 ${theme.spacing.medium}`,
          backgroundColor: theme.colors.primary,
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.medium }}>
          <span>Pet Society</span>
          <button
            type="button"
            onClick={() => setIsShopModalOpen(true)}
            aria-label="Abrir Tienda"
            style={{
              backgroundColor: theme.colors.accent,
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            }}
          >
            <span aria-hidden="true">🏪</span>
            <span>Tienda</span>
          </button>
        </div>

        {/* Pestañas de vista inferior */}
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('care');
              setSelectedFurnitureId(null);
            }}
            style={{
              backgroundColor:
                activeBottomTab === 'care'
                  ? theme.colors.primaryDark
                  : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.borderRadius.small,
              padding: `${theme.spacing.xs} ${theme.spacing.small}`,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Cuidados
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveBottomTab('customize');
              setSelectedFurnitureId(null);
            }}
            style={{
              backgroundColor:
                activeBottomTab === 'customize'
                  ? theme.colors.primaryDark
                  : 'transparent',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.borderRadius.small,
              padding: `${theme.spacing.xs} ${theme.spacing.small}`,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Personalizar
          </button>
          <button
            type="button"
            onClick={() => setActiveBottomTab('decorate')}
            style={{
              backgroundColor:
                activeBottomTab === 'decorate'
                  ? theme.colors.primaryDark
                  : 'transparent',
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
            }}
          >
            <span>🛋️</span>
            <span>Decorar</span>
          </button>
        </div>
      </header>

      {/* HUD de Necesidades y Estado Vital */}
      <div
        style={{
          padding: `${theme.spacing.small} ${theme.spacing.medium}`,
          backgroundColor: theme.colors.cardBackground,
          borderBottom: `1px solid ${theme.colors.cardBorder}`,
          flexShrink: 0,
        }}
      >
        <NeedsHUD
          petName={currentPet.name}
          level={currentPet.level}
          needs={currentPet.needs}
          wallet={wallet}
        />
      </div>

      {/* Área principal del juego con lienzo WebGL de PixiJS */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
        }}
      >
        <GameCanvas
          appearance={currentPet.appearance}
          clothes={currentPet.clothes}
          room={room}
          isDecorating={activeBottomTab === 'decorate'}
          selectedFurnitureId={selectedFurnitureId}
          onPetClick={pet}
          onFurnitureMove={(itemId, newPos) => {
            moveFurniture(itemId, newPos);
          }}
          onFurnitureSelect={setSelectedFurnitureId}
        />

        {/* Indicador flotante en modo decoración */}
        {activeBottomTab === 'decorate' && (
          <div
            style={{
              position: 'absolute',
              top: theme.spacing.small,
              right: theme.spacing.small,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              color: '#FFFFFF',
              padding: `${theme.spacing.xs} ${theme.spacing.medium}`,
              borderRadius: theme.borderRadius.pill,
              fontFamily: 'sans-serif',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.small,
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <span>🛋️ Modo Decoración Activo</span>
            <button
              type="button"
              onClick={() => {
                setActiveBottomTab('care');
                setSelectedFurnitureId(null);
              }}
              style={{
                backgroundColor: theme.colors.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: theme.borderRadius.small,
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Listo ✓
            </button>
          </div>
        )}

        {/* Notificación flotante de feedback (toast) */}
        {feedbackMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              top: theme.spacing.medium,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: theme.colors.feedbackToastBackground,
              color: theme.colors.feedbackToastText,
              padding: `${theme.spacing.small} ${theme.spacing.large}`,
              borderRadius: theme.borderRadius.pill,
              fontFamily: 'sans-serif',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 20,
              whiteSpace: 'nowrap',
            }}
          >
            {feedbackMessage}
          </div>
        )}
      </main>

      {/* Panel inferior interactivo */}
      <footer
        style={{
          flexShrink: 0,
          backgroundColor: theme.colors.cardBackground,
          borderTop: `1px solid ${theme.colors.cardBorder}`,
          padding: theme.spacing.small,
        }}
      >
        {activeBottomTab === 'care' && (
          <div style={{ padding: `${theme.spacing.xs} 0` }}>
            <CareActions
              onOpenFoodModal={() => setIsFoodModalOpen(true)}
              onClean={() => clean()}
              onPet={pet}
              foodCount={foodCount}
            />
          </div>
        )}

        {activeBottomTab === 'customize' && (
          <PetCustomizer
            appearance={currentPet.appearance}
            onChangeAppearance={updateAppearance}
            clothes={currentPet.clothes ?? {}}
            onChangeClothes={updateClothes}
          />
        )}

        {activeBottomTab === 'decorate' && (
          <DecorationPanel
            inventory={inventory}
            room={room}
            selectedItemId={selectedFurnitureId}
            onPlaceItem={(itemId) => {
              placeFurniture(itemId);
            }}
            onRemoveItem={(itemId) => {
              if (selectedFurnitureId === itemId) {
                setSelectedFurnitureId(null);
              }
              removeFurniture(itemId);
            }}
            onSelectPlacedItem={setSelectedFurnitureId}
          />
        )}
      </footer>

      {/* Modal de selección de comida */}
      <FoodSelectorModal
        isOpen={isFoodModalOpen}
        inventory={inventory}
        onClose={() => setIsFoodModalOpen(false)}
        onSelectFood={(item) => feed(item)}
        onOpenShop={() => setIsShopModalOpen(true)}
      />

      {/* Modal de la tienda de ítems */}
      <ShopModal
        isOpen={isShopModalOpen}
        wallet={wallet}
        onClose={() => setIsShopModalOpen(false)}
        onBuyItem={buyItem}
      />
    </div>
  );
};
