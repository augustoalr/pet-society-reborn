import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MinigameHUD } from '../MinigameHUD';

describe('MinigameHUD (Interfaz del Minijuego de Pelota)', () => {
  it('renderiza la barra superior con toques, récord y monedas acumuladas', () => {
    const html = renderToString(
      <MinigameHUD
        status="playing"
        score={8}
        combo={8}
        highScore={12}
        sessionCoins={24}
        onRestart={vi.fn()}
        onExitToRoom={vi.fn()}
      />
    );

    expect(html).toContain('Toques:');
    expect(html).toContain('8');
    expect(html).toContain('🏆');
    expect(html).toContain('12');
    expect(html).toContain('+24');
    expect(html).toContain('Combo x8!');
    expect(html).toContain('Volver a casa');
  });

  it('muestra el banner instructivo cuando el juego está en estado idle', () => {
    const html = renderToString(
      <MinigameHUD
        status="idle"
        score={0}
        combo={0}
        highScore={5}
        sessionCoins={0}
        onRestart={vi.fn()}
        onExitToRoom={vi.fn()}
      />
    );

    expect(html).toContain('¡Toca o haz clic en la pelota para comenzar los malabares!');
    expect(html).toContain('Golpea la pelota antes de que caiga al suelo');
  });

  it('muestra la ventana modal de Game Over con estadísticas y recompensas al terminar', () => {
    const html = renderToString(
      <MinigameHUD
        status="game_over"
        score={10}
        combo={0}
        highScore={10}
        sessionCoins={30}
        lastEarnedCoins={30}
        lastEarnedHappiness={20}
        onRestart={vi.fn()}
        onExitToRoom={vi.fn()}
      />
    );

    expect(html).toContain('¡Fin de la partida!');
    expect(html).toContain('La pelota tocó el césped del jardín.');
    expect(html).toContain('Toques logrados:');
    expect(html).toContain('10');
    expect(html).toContain('¡Nuevo récord de la sesión!');
    expect(html).toContain('+30 🪙');
    expect(html).toContain('+20 ❤️');
    expect(html).toContain('Jugar de nuevo 🔄');
    expect(html).toContain('Volver a casa 🏠');
  });

  it('no muestra el banner de nuevo récord si la puntuación no iguala o supera el récord', () => {
    const html = renderToString(
      <MinigameHUD
        status="game_over"
        score={4}
        combo={0}
        highScore={15}
        sessionCoins={8}
        lastEarnedCoins={8}
        lastEarnedHappiness={8}
        onRestart={vi.fn()}
        onExitToRoom={vi.fn()}
      />
    );

    expect(html).toContain('¡Fin de la partida!');
    expect(html).not.toContain('¡Nuevo récord de la sesión!');
    expect(html).toContain('+8 🪙');
  });
});
