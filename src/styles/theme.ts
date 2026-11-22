export const theme = {
  colors: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    background: '#F5F5F5',
    text: '#333333',
    textMuted: '#757575',
    /** Fondo del canvas de juego (cielo azul claro) — valor hexadecimal para PixiJS. */
    gameSky: 0x87CEEB,
    /** Fondo envolvente cálido y acogedor que enmarca el escenario diorama (reemplazo de barras negras). */
    gameContainerBackground: '#ede2d1',
    /** Degradado radial cálido y estilizado que rodea la habitación diorama sin cortes bruscos. */
    dioramaBackdrop: 'radial-gradient(ellipse at center, #faf4eb 0%, #ede0cf 55%, #dfceb9 100%)',
    /** Sombra perimetral suave del escenario diorama contra el fondo envolvente. */
    dioramaShadow: '0 16px 48px rgba(70, 45, 20, 0.22), 0 4px 16px rgba(70, 45, 20, 0.12)',
    /** Borde sutil del marco diorama. */
    dioramaBorder: '2px solid rgba(255, 255, 255, 0.45)',
    /** Texto del estado de carga del motor gráfico. */
    loadingText: '#7a6045',

    // Tokens de UI para controles interactivos
    cardBackground: '#ffffff',
    cardBorder: '#e0e0e0',
    activeOption: '#4CAF50',
    activeOptionText: '#ffffff',
    inactiveOption: '#f5f5f5',
    inactiveOptionText: '#424242',
    accent: '#FF9800',

    // Tokens semánticos de barras de estado y necesidades (T-05)
    statusGood: '#4CAF50', // Verde (> 60%)
    statusWarning: '#FFA000', // Ámbar/Amarillo (30% - 60%)
    statusDanger: '#E53935', // Rojo (< 30%)
    barBackground: '#E0E0E0',
    barBorder: '#BDBDBD',
    hudBackground: 'rgba(255, 255, 255, 0.95)',
    hudBorder: '#E0E0E0',
    hudShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    actionButtonBackground: '#FFFFFF',
    actionButtonBorder: '#CCCCCC',
    actionButtonHover: '#E8F5E9',
    coinGold: '#FFB300',
    cashGreen: '#2E7D32',
    tagBackground: '#E8F5E9',
    tagText: '#2E7D32',
    danger: '#E53935',
    feedbackToastBackground: '#323232',
    feedbackToastText: '#FFFFFF',
  },
  spacing: {
    xs: '4px',
    small: '8px',
    medium: '16px',
    large: '24px',
    xlarge: '32px',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    pill: '9999px',
    round: '50%',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
  },
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
} as const;
