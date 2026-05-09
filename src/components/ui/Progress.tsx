import { C } from '../../lib/theme'

interface ProgressProps {
  value: number
  color?: string
  height?: number
  showLabel?: boolean
  style?: React.CSSProperties
}

export function Progress({ value, color = '#E10600', height = 4, showLabel = false, style }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...style }}>
      <div style={{
        flex: 1, height, background: 'rgba(255,255,255,0.06)',
        borderRadius: 9999, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${clamped}%`,
          background: color, borderRadius: 9999,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {showLabel && (
        <span style={{ fontSize: 12, color: C.textMuted, minWidth: 32, textAlign: 'right' }}>
          {clamped}%
        </span>
      )}
    </div>
  )
}
