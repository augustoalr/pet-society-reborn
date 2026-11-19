import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { theme } from '../styles';

/**
 * Componente raíz de la aplicación.
 *
 * Estructura el layout principal: un HUD superior fijo y un área de juego
 * que ocupa todo el espacio restante, donde se monta el canvas de PixiJS.
 */
export const App: React.FC = () => {
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
      {/* HUD superior — placeholder para barras de necesidades, monedas, etc. */}
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

      {/* Área de juego: ocupa todo el espacio vertical restante */}
      <main style={{ flex: 1, minHeight: 0 }}>
        <GameCanvas />
      </main>
    </div>
  );
};
