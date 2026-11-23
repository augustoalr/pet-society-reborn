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

    // Tokens de Diseño Estilo Pet Society Flash (T-UI-OVERHAUL)
    flashBezel: '#3D2B1F',
    flashGold: '#FFD54F',
    flashGoldDark: '#FFA000',
    flashCash: '#43A047',
    flashCashDark: '#1B5E20',
    flashWood: '#8D6E63',
    flashWoodDark: '#5D4037',
    flashParchment: '#FFF8E7',
    flashParchmentDark: '#EFE3CF',
    flashPodBackground: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9F0 60%, #F5E8D3 100%)',
    flashPodBorder: '2.5px solid #8C6A43',
    flashPodShadow: '0 8px 24px rgba(60, 40, 20, 0.25), inset 0 2px 0 rgba(255, 255, 255, 0.8)',
    flashDockBackground: 'linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 241, 230, 0.96) 50%, rgba(235, 219, 196, 0.96) 100%)',
    flashDockBorder: '3px solid #8C6A43',
    flashDockShadow: '0 10px 28px rgba(60, 40, 20, 0.35), inset 0 2px 0 rgba(255, 255, 255, 0.9)',
    flashMeterTrack: '#261C14',
    flashGlossHighlight: 'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 48%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.15) 100%)',
    flashBadgeBackground: 'linear-gradient(180deg, #AB47BC 0%, #8E24AA 100%)',
    flashBadgeBorder: '1.5px solid #FFFFFF',
    flashToastBackground: 'linear-gradient(180deg, #FFF9C4 0%, #FFF176 100%)',
    flashToastBorder: '2.5px solid #5D4037',
    flashToastText: '#3E2723',
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
    xlarge: '20px',
    pill: '9999px',
    round: '50%',
  },
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
    bouncy: '0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  typography: {
    fontFamily: "'Nunito', 'Comfortaa', 'Quicksand', 'Arial Rounded MT Bold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
} as const;
