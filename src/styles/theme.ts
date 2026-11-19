export const theme = {
  colors: {
    primary: '#4CAF50',
    background: '#F5F5F5',
    text: '#333333',
    /** Fondo del canvas de juego (cielo azul claro) — valor hexadecimal para PixiJS. */
    gameSky: 0x87CEEB,
    /** Fondo del contenedor que rodea el canvas (barras de letterbox/pillarbox). */
    gameContainerBackground: '#1a1a2e',
    /** Texto del estado de carga del motor gráfico. */
    loadingText: '#cccccc',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
} as const;
