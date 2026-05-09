import { C } from '../../lib/theme'

const COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777']

function colorFor(name: string) {
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

interface AvatarProps {
  name: string
  src?: string
  size?: number
  style?: React.CSSProperties
}

export function Avatar({ name, src, size = 36, style }: AvatarProps) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()

  if (src) return (
    <img src={src} alt={name} width={size} height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }} />
  )

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: colorFor(name), display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: C.white,
      ...style,
    }}>
      {initials}
    </div>
  )
}
