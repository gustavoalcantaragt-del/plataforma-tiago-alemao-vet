// ─────────────────────────────────────────────
// DESIGN SYSTEM — Tiago Alemão VET
// ─────────────────────────────────────────────

export const C = {
  bg: '#0B0B0B',
  bgCard: '#111111',
  bgElevated: '#1A1A1A',
  bgGlass: 'rgba(255,255,255,0.03)',
  // Aliases for convenience
  surface: '#1A1A1A',
  surfaceHover: '#222222',
  border: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderRed: 'rgba(225,6,0,0.4)',
  // Keep borderActive as alias for borderRed
  borderActive: 'rgba(225,6,0,0.4)',
  red: '#E10600',
  redHover: '#C40000',
  redSoft: '#FF3B30',
  redGrad: '#E10600',
  text: '#FFFFFF',
  textMuted: '#888888',
  textDim: '#555555',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
  white: '#FFFFFF',
} as const

export const font = "'Inter', 'Outfit', sans-serif"

export const shadow = {
  red: '0 0 30px rgba(225,6,0,0.12)',
  card: '0 4px 24px rgba(0,0,0,0.5)',
  modal: '0 8px 48px rgba(0,0,0,0.7)',
} as const

export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  full: '9999px',
} as const

export const transition = 'all 0.2s ease'
