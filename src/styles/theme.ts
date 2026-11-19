export const theme = {
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: '#F5F5F5',
    text: '#333333',
    /** Fondo del canvas de juego (cielo azul claro) — valor hexadecimal para PixiJS. */
    gameSky: 0x87CEEB,
    /** Fondo del contenedor que rodea el canvas (barras de letterbox/pillarbox). */
    gameContainerBackground: '#1a1a2e',
    /** Texto del estado de carga del motor gráfico. */
    loadingText: '#cccccc',
    // Tokens de UI para controles interactivos
    cardBackground: '#ffffff',
    cardBorder: '#e0e0e0',
    activeOption: '#4CAF50',
    activeOptionText: '#ffffff',
    inactiveOption: '#f5f5f5',
    inactiveOptionText: '#424242',
    accent: '#FF9800',
  },
  spacing: {
    xs: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    round: '50%',
  },
} as const;
