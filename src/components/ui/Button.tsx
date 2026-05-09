import { C, transition } from '../../lib/theme'
import { useState } from 'react'

type BtnVariant = 'primary' | 'ghost' | 'danger' | 'outline' | 'glass'
type BtnSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const VARIANTS: Record<BtnVariant, React.CSSProperties> = {
  primary: { background: '#E10600', color: '#fff', fontWeight: 700 },
  ghost:   { background: 'transparent', color: C.textMuted, border: '1px solid rgba(255,255,255,0.08)' },
  danger:  { background: 'rgba(220,38,38,0.12)', color: '#DC2626', border: `1px solid rgba(220,38,38,0.2)` },
  outline: { background: 'transparent', color: '#E10600', border: `1px solid rgba(225,6,0,0.4)` },
  glass:   { background: 'rgba(255,255,255,0.04)', color: C.text, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' },
}

const SIZES: Record<BtnSize, React.CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 12, borderRadius: 6 },
  md: { padding: '10px 20px', fontSize: 14, borderRadius: 10 },
  lg: { padding: '14px 28px', fontSize: 16, borderRadius: 14 },
}

export function Button({
  variant = 'ghost', size = 'md', fullWidth = false,
  loading = false, icon, children, disabled, style, onClick, ...rest
}: ButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, cursor: disabled || loading ? 'not-allowed' : 'pointer',
        border: 'none', fontFamily: 'inherit', letterSpacing: '0.01em',
        transition,
        opacity: (disabled || loading) ? 0.5 : hovered ? 0.9 : 1,
        width: fullWidth ? '100%' : undefined,
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
        ...VARIANTS[variant],
        ...SIZES[size],
        ...style,
      }}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14, border: '2px solid currentColor',
          borderTopColor: 'transparent', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : icon}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  )
}
