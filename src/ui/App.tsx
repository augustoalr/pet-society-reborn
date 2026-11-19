import React, { useState } from 'react';
import { usePetCare } from '../infrastructure';
import { theme } from '../styles';
import {
  GameCanvas,
  PetCustomizer,
  NeedsHUD,
  CareActions,
  FoodSelectorModal,
} from './components';

/**
 * Componente raíz de la aplicación Pet Society (Reborn).
 *
 * Estructura de la interfaz:
 * - HUD superior: Muestra estado vital de la mascota (Hambre, Higiene, Energía, Felicidad) y billetera.
 * - Lienzo de juego (PixiJS): Mascota procedural responsive con detección de clics directos para acariciar.
 * - Barra flotante de acciones rápidas de cuidado: Alimentar, Jabón y Acariciar.
 * - Modal de selección de comida del inventario.
 * - Panel inferior con selector de modo (Cuidados / Personalizador de aspecto de T-04).
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
  } = usePetCare();

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<'care' | 'customize'>('care');

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

  const { pet: currentPet, inventory, wallet } = gameState;
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
        <span>Pet Society</span>

        {/* Pestañas de vista inferior */}
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
          <button
            type="button"
            onClick={() => setActiveBottomTab('care')}
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
            onClick={() => setActiveBottomTab('customize')}
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
          onPetClick={pet}
        />

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
        {activeBottomTab === 'care' ? (
          <div style={{ padding: `${theme.spacing.xs} 0` }}>
            <CareActions
              onOpenFoodModal={() => setIsFoodModalOpen(true)}
              onClean={() => clean()}
              onPet={pet}
              foodCount={foodCount}
            />
          </div>
        ) : (
          <PetCustomizer
            appearance={currentPet.appearance}
            onChangeAppearance={updateAppearance}
            clothes={currentPet.clothes ?? {}}
            onChangeClothes={updateClothes}
          />
        )}
      </footer>

      {/* Modal de selección de comida */}
      <FoodSelectorModal
        isOpen={isFoodModalOpen}
        inventory={inventory}
        onClose={() => setIsFoodModalOpen(false)}
        onSelectFood={(item) => feed(item)}
      />
    </div>
  );
};
