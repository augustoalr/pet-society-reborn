import React, { useEffect, useRef, useState } from 'react';
import type { PetAppearance, PetClothes } from '../../domain';
import { PixiGameEngine } from '../../game';
import { theme } from '../../styles';

/**
 * Estado del ciclo de vida del motor gráfico dentro del componente.
 *
 * - `loading`: El motor se está inicializando (app.init es asíncrono).
 * - `ready`: El canvas está montado y renderizando.
 * - `error`: La inicialización falló (p.ej. WebGL no soportado).
 */
type EngineStatus = 'loading' | 'ready' | 'error';

export interface GameCanvasProps {
  readonly appearance?: PetAppearance;
  readonly clothes?: PetClothes | readonly string[];
  /** Callback al hacer clic o tocar sobre la mascota (para acariciarla). */
  readonly onPetClick?: () => void;
}

/**
 * Componente React que monta el lienzo de PixiJS dentro de un contenedor
 * y gestiona su ciclo de vida de forma segura con React 19.
 *
 * Responsabilidades:
 * - Contener el canvas WebGL generado por PixiGameEngine.
 * - Observar cambios de tamaño del contenedor (ResizeObserver) y
 *   eventos de resize de ventana para mantener el escalado responsive.
 * - Mostrar un estado de carga mientras el motor se inicializa.
 * - Destruir limpiamente el motor al desmontar el componente.
 *
 * La UI es "tonta": no contiene lógica de juego, solo monta y conecta
 * el motor gráfico con el DOM (R-01: SoC).
 */
export const GameCanvas: React.FC<GameCanvasProps> = ({ appearance, clothes, onPetClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<PixiGameEngine | null>(null);
  const [status, setStatus] = useState<EngineStatus>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const engine = new PixiGameEngine();
    engineRef.current = engine;
    let destroyed = false;

    const initEngine = async () => {
      try {
        await engine.initialize(container);
        // Verifica que no se haya destruido mientras esperábamos init
        if (!destroyed) {
          setStatus('ready');
        }
      } catch {
        if (!destroyed) {
          setStatus('error');
        }
      }
    };

    // --- Resize: ResizeObserver + window.resize ---
    const handleResize = () => {
      if (!engine.isInitialized || !container) {
        return;
      }
      engine.resize(container.clientWidth, container.clientHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    initEngine();

    // Cleanup: destruir el motor y desconectar observers
    return () => {
      destroyed = true;
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sincronización reactiva de apariencia y ropa con el motor
  useEffect(() => {
    if (status === 'ready' && engineRef.current && appearance) {
      engineRef.current.updatePetAppearance(appearance, clothes);
    }
  }, [appearance, clothes, status]);

  // Sincronización del handler de interacción directa con la mascota
  useEffect(() => {
    if (status === 'ready' && engineRef.current) {
      engineRef.current.setPetClickHandler(onPetClick ?? null);
    }
  }, [onPetClick, status]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: theme.colors.gameContainerBackground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            color: theme.colors.loadingText,
            fontFamily: 'sans-serif',
            fontSize: '1.2rem',
          }}
        >
          Cargando…
        </div>
      )}
      {status === 'error' && (
        <div
          style={{
            position: 'absolute',
            color: theme.colors.loadingText,
            fontFamily: 'sans-serif',
            fontSize: '1rem',
            textAlign: 'center',
            padding: theme.spacing.medium,
          }}
        >
          No se pudo iniciar el motor gráfico.
          <br />
          Verifica que tu navegador soporte WebGL.
        </div>
      )}
    </div>
  );
};
