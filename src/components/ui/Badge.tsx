import { C } from '../../lib/theme'

type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'muted' | 'default'

const VARIANTS: Record<BadgeVariant, { bg: string; color: string }> = {
  primary: { bg: 'rgba(225,6,0,0.15)', color: '#E10600' },
  success: { bg: 'rgba(22,163,74,0.12)', color: C.success },
  danger:  { bg: 'rgba(220,38,38,0.12)', color: C.danger },
  warning: { bg: 'rgba(245,158,11,0.12)', color: C.warning },
  muted:   { bg: 'rgba(255,255,255,0.06)', color: C.textMuted },
  default: { bg: 'rgba(255,255,255,0.08)', color: C.text },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  style?: React.CSSProperties
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  const v = VARIANTS[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: v.bg, color: v.color,
      ...style,
    }}>
      {children}
    </span>
  )
}
