import React, { useState } from 'react';
import type { MinigameStatus, InventoryItem } from '../domain';
import { usePetCare, soundService } from '../infrastructure';
import { theme } from '../styles';
import {
  GameCanvas,
  PetCustomizer,
  PetStatusHUD,
  BottomDock,
  FoodSelectorModal,
  DecorationPanel,
  ShopModal,
  MinigameHUD,
} from './components';

/**
 * Componente raíz de la aplicación Pet Society (Reborn).
 *
 * Arquitectura de Interfaz Canónica Flash (Playfish 2008-2013):
 * - Experiencia Inmersiva: El lienzo del juego (PixiJS) ocupa el 100% del área visual.
 * - HUD Superior Izquierdo: Pod de estado vital (Hambre, Higiene, Energía, Felicidad), Nivel/Paw Points y Billetera dual.
 * - Dock Inferior Flotante: 5 botones circulares 3D de acción canónicos (Puerta, Baúl, Armario, Herramienta, Pelota).
 * - Paneles Desplegables (Drawers): Armario/Vestidor y Modo Decoración emergen flotantes sobre el dock sin romper la inmersión.
 * - Controles Auxiliares: Medallón de sonido/silencio en la esquina superior derecha y banner de feedback toast animado.
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
    recordMinigameResult,
  } = usePetCare();

  const [viewMode, setViewMode] = useState<'room' | 'minigame'>('room');
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isDecorating, setIsDecorating] = useState(false);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(() => soundService.isMuted);

  // Handlers con feedback sonoro procedimental (T-10)
  const handleToggleMute = () => {
    void soundService.resumeContext();
    const nextMuted = soundService.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleFeed = (item: InventoryItem) => {
    void soundService.resumeContext();
    const success = feed(item);
    if (success) {
      soundService.playFeed();
    }
  };

  const handleClean = (soapEfficiency?: number) => {
    void soundService.resumeContext();
    clean(soapEfficiency);
    soundService.playClean();
  };

  const handlePet = () => {
    void soundService.resumeContext();
    pet();
    soundService.playPet();
  };

  const handleBuyItem = (shopItemId: string, quantity?: number) => {
    void soundService.resumeContext();
    const result = buyItem(shopItemId, quantity);
    if (result.success) {
      soundService.playBuy();
    }
    return result;
  };

  // Estados reactivos del minijuego de pelota en el jardín (T-09)
  const [minigameScore, setMinigameScore] = useState(0);
  const [minigameCombo, setMinigameCombo] = useState(0);
  const [minigameHighScore, setMinigameHighScore] = useState(0);
  const [minigameStatus, setMinigameStatus] = useState<MinigameStatus>('idle');
  const [minigameSessionCoins, setMinigameSessionCoins] = useState(0);
  const [lastMinigameReward, setLastMinigameReward] = useState<{
    coins: number;
    happiness: number;
  }>({ coins: 0, happiness: 0 });
  const [restartSignal, setRestartSignal] = useState(0);

  if (isLoading || !gameState) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.dioramaBackdrop,
          backgroundColor: theme.colors.gameContainerBackground,
          color: theme.colors.loadingText,
          fontFamily: theme.typography.fontFamily,
          fontSize: '1.25rem',
          fontWeight: 800,
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
        position: 'relative',
        overflow: 'hidden',
        background: theme.colors.dioramaBackdrop,
        backgroundColor: theme.colors.gameContainerBackground,
        margin: 0,
        padding: 0,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {/* 1. Lienzo de juego interactivo a pantalla completa (PixiJS) */}
      <main
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}
      >
        <GameCanvas
          appearance={currentPet.appearance}
          clothes={currentPet.clothes}
          room={room}
          mode={viewMode}
          restartMinigameSignal={restartSignal}
          isDecorating={viewMode === 'room' && isDecorating}
          selectedFurnitureId={selectedFurnitureId}
          onPetClick={handlePet}
          onFurnitureMove={(itemId, newPos) => {
            moveFurniture(itemId, newPos);
          }}
          onFurnitureSelect={setSelectedFurnitureId}
          onMinigameHit={() => {
            soundService.playBallHit();
          }}
          onMinigameScoreChange={(score, combo) => {
            setMinigameScore(score);
            setMinigameCombo(combo);
            setMinigameStatus('playing');
          }}
          onMinigameGameOver={(finalScore) => {
            soundService.playGameOver();
            setMinigameStatus('game_over');
            const reward = recordMinigameResult(finalScore);
            setLastMinigameReward({
              coins: reward.coinsEarned,
              happiness: reward.happinessEarned,
            });
            setMinigameSessionCoins((prev) => prev + reward.coinsEarned);
            setMinigameHighScore((prev) => Math.max(prev, finalScore));
          }}
          onMinigameStateChange={(state) => {
            setMinigameStatus(state.status);
            setMinigameScore(state.score);
            setMinigameCombo(state.combo);
            setMinigameHighScore(state.highScore);
          }}
        />
      </main>

      {/* 2. HUD Superior Izquierdo: Pod de Estado Vital y Economía */}
      <div
        style={{
          position: 'absolute',
          top: theme.spacing.medium,
          left: theme.spacing.medium,
          zIndex: 25,
        }}
      >
        <PetStatusHUD
          petName={currentPet.name}
          level={currentPet.level}
          needs={currentPet.needs}
          wallet={wallet}
        />
      </div>

      {/* 3. Control Auxiliar Superior Derecho: Medallón de Audio/Silencio */}
      <div
        style={{
          position: 'absolute',
          top: theme.spacing.medium,
          right: theme.spacing.medium,
          zIndex: 25,
        }}
      >
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: theme.borderRadius.round,
            border: `2.5px solid ${theme.colors.flashBezel}`,
            background: isMuted
              ? 'linear-gradient(180deg, #E0E0E0 0%, #BDBDBD 100%)'
              : 'linear-gradient(180deg, #FFF9C4 0%, #FFD54F 50%, #FFA000 100%)',
            boxShadow: `0 4px 0 ${theme.colors.flashBezel}, 0 6px 14px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.75)`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            padding: 0,
            outline: 'none',
            transition: `transform ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.boxShadow = `0 2px 0 ${theme.colors.flashBezel}, 0 3px 6px rgba(0,0,0,0.25)`;
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 0 ${theme.colors.flashBezel}, 0 6px 14px rgba(0,0,0,0.25), inset 0 2px 0 rgba(255,255,255,0.75)`;
          }}
        >
          <span aria-hidden="true">{isMuted ? '🔇' : '🔊'}</span>
        </button>
      </div>

      {/* 4. Notificación Flotante Superior de Feedback (Toast) */}
      {feedbackMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            top: theme.spacing.medium,
            left: '50%',
            transform: 'translateX(-50%)',
            background: theme.colors.flashToastBackground,
            border: theme.colors.flashToastBorder,
            color: theme.colors.flashToastText,
            padding: `${theme.spacing.small} ${theme.spacing.large}`,
            borderRadius: theme.borderRadius.pill,
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.92rem',
            fontWeight: 900,
            boxShadow: '0 6px 20px rgba(60, 40, 20, 0.3), inset 0 2px 0 rgba(255,255,255,0.9)',
            pointerEvents: 'none',
            zIndex: 50,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textShadow: '0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <span aria-hidden="true">✨</span>
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 5. HUD Superpuesto del Minijuego de Pelota en el Jardín */}
      {viewMode === 'minigame' && (
        <MinigameHUD
          status={minigameStatus}
          score={minigameScore}
          combo={minigameCombo}
          highScore={minigameHighScore}
          sessionCoins={minigameSessionCoins}
          lastEarnedCoins={lastMinigameReward.coins}
          lastEarnedHappiness={lastMinigameReward.happiness}
          onRestart={() => {
            setMinigameStatus('idle');
            setMinigameScore(0);
            setMinigameCombo(0);
            setRestartSignal((prev) => prev + 1);
          }}
          onExitToRoom={() => setViewMode('room')}
        />
      )}

      {/* 6. Panel Flotante Desplegable: Armario y Vestidor */}
      {viewMode === 'room' && isWardrobeOpen && (
        <div
          role="region"
          aria-label="Panel de Vestidor y Personalizador"
          style={{
            position: 'absolute',
            bottom: '98px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(94vw, 720px)',
            maxHeight: '45vh',
            background: theme.colors.flashPodBackground,
            border: theme.colors.flashPodBorder,
            borderRadius: theme.borderRadius.xlarge,
            boxShadow: theme.colors.flashPodShadow,
            zIndex: 40,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Cabecera del Armario */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${theme.spacing.small} ${theme.spacing.medium}`,
              borderBottom: '2px solid rgba(140, 106, 67, 0.25)',
              background: 'linear-gradient(180deg, #FFF8E7 0%, #F5E8D3 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
                👗
              </span>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#3E2723' }}>
                Armario & Vestidor de Mascota
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsWardrobeOpen(false)}
              aria-label="Cerrar armario"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: theme.borderRadius.round,
                border: '1.5px solid #5D4037',
                backgroundColor: '#FFEBEE',
                color: '#C62828',
                fontSize: '0.85rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 0 #5D4037',
              }}
            >
              ✕
            </button>
          </div>

          {/* Selector de aspecto y ropa */}
          <div style={{ overflowY: 'auto', padding: theme.spacing.small }}>
            <PetCustomizer
              appearance={currentPet.appearance}
              onChangeAppearance={updateAppearance}
              clothes={currentPet.clothes ?? {}}
              onChangeClothes={updateClothes}
            />
          </div>
        </div>
      )}

      {/* 7. Panel Flotante Desplegable: Modo Decoración y Baúl de Muebles */}
      {viewMode === 'room' && isDecorating && (
        <div
          role="region"
          aria-label="Panel de Modo Decoración"
          style={{
            position: 'absolute',
            bottom: '98px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(94vw, 720px)',
            maxHeight: '45vh',
            background: theme.colors.flashPodBackground,
            border: theme.colors.flashPodBorder,
            borderRadius: theme.borderRadius.xlarge,
            boxShadow: theme.colors.flashPodShadow,
            zIndex: 40,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Cabecera de Decoración */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${theme.spacing.small} ${theme.spacing.medium}`,
              borderBottom: '2px solid rgba(140, 106, 67, 0.25)',
              background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.25rem' }} aria-hidden="true">
                🛋️
              </span>
              <span style={{ fontWeight: 900, fontSize: '0.95rem', color: '#1B5E20' }}>
                Modo Decoración — Arrastra o Coloca Muebles
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsDecorating(false);
                setSelectedFurnitureId(null);
              }}
              aria-label="Finalizar decoración"
              style={{
                padding: '4px 14px',
                borderRadius: theme.borderRadius.pill,
                border: '2px solid #2E7D32',
                backgroundColor: '#4CAF50',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 0 #2E7D32',
              }}
            >
              <span>Listo ✓</span>
            </button>
          </div>

          {/* Panel de muebles */}
          <div style={{ overflowY: 'auto', padding: theme.spacing.small }}>
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
          </div>
        </div>
      )}

      {/* 8. Dock Inferior Flotante de Acciones Estilo Flash */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
        }}
      >
        <BottomDock
          onOpenShop={() => {
            void soundService.resumeContext();
            setIsShopModalOpen(true);
          }}
          onOpenChest={() => {
            void soundService.resumeContext();
            setIsFoodModalOpen(true);
          }}
          onToggleWardrobe={() => {
            void soundService.resumeContext();
            setIsWardrobeOpen((prev) => !prev);
            if (isDecorating) {
              setIsDecorating(false);
            }
          }}
          onToggleDecorate={() => {
            void soundService.resumeContext();
            setIsDecorating((prev) => !prev);
            if (isWardrobeOpen) {
              setIsWardrobeOpen(false);
            }
            setSelectedFurnitureId(null);
          }}
          onToggleMinigame={() => {
            void soundService.resumeContext();
            if (viewMode === 'room') {
              setViewMode('minigame');
              setMinigameStatus('idle');
              setMinigameScore(0);
              setMinigameCombo(0);
              setSelectedFurnitureId(null);
              setIsWardrobeOpen(false);
              setIsDecorating(false);
            } else {
              setViewMode('room');
            }
          }}
          isWardrobeActive={viewMode === 'room' && isWardrobeOpen}
          isDecorateActive={viewMode === 'room' && isDecorating}
          isMinigameActive={viewMode === 'minigame'}
          foodCount={foodCount}
        />
      </div>

      {/* 9. Modal de Alimentos y Cuidados (Baúl) */}
      <FoodSelectorModal
        isOpen={isFoodModalOpen}
        inventory={inventory}
        onClose={() => setIsFoodModalOpen(false)}
        onSelectFood={(item) => handleFeed(item)}
        onOpenShop={() => setIsShopModalOpen(true)}
        onClean={() => handleClean()}
        onPet={handlePet}
      />

      {/* 10. Modal de la Tienda de Ítems (Puerta) */}
      <ShopModal
        isOpen={isShopModalOpen}
        wallet={wallet}
        onClose={() => setIsShopModalOpen(false)}
        onBuyItem={handleBuyItem}
      />
    </div>
  );
};
