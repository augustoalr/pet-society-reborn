import React, { useState } from 'react';
import type { PetAppearance, PetClothes } from '../domain';
import { theme } from '../styles';
import { GameCanvas } from './components/GameCanvas';
import { PetCustomizer } from './components/PetCustomizer';

/**
 * Componente raíz de la aplicación.
 *
 * Estructura el layout principal:
 * - HUD superior fijo.
 * - Área de juego responsiva donde se monta el canvas de PixiJS con la mascota.
 * - Panel inferior interactivo para personalizar y probar la reactividad
 *   del renderizado por capas en vivo (T-04).
 */
export const App: React.FC = () => {
  const [appearance, setAppearance] = useState<PetAppearance>({
    color: 'pink',
    eyes: 'round',
    mouth: 'smile',
    ears: 'floppy',
  });

  const [clothes, setClothes] = useState<PetClothes>({
    hat: null,
    shirt: null,
    accessory: null,
  });

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
      {/* HUD superior — encabezado */}
      <header
        style={{
          flexShrink: 0,
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
          fontWeight: 'bold',
          fontSize: '1.1rem',
        }}
      >
        Pet Society
      </header>

      {/* Área de juego: lienzo responsive con la mascota */}
      <main style={{ flex: 1, minHeight: 0 }}>
        <GameCanvas appearance={appearance} clothes={clothes} />
      </main>

      {/* Selector interactivo de apariencia en vivo */}
      <footer style={{ flexShrink: 0 }}>
        <PetCustomizer
          appearance={appearance}
          onChangeAppearance={setAppearance}
          clothes={clothes}
          onChangeClothes={setClothes}
        />
      </footer>
    </div>
  );
};
