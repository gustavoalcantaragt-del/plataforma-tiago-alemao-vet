import { C } from '../../lib/theme'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: `linear-gradient(90deg, ${C.bgElevated} 25%, rgba(255,255,255,0.04) 50%, ${C.bgElevated} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
      ...style,
    }}>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
      borderRadius: 12, padding: 20,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <Skeleton height={140} borderRadius={8} />
      <Skeleton height={18} width="70%" />
      <Skeleton height={14} width="90%" />
      <Skeleton height={14} width="60%" />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Skeleton height={32} width={80} borderRadius={8} />
        <Skeleton height={32} width={80} borderRadius={8} />
      </div>
    </div>
  )
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
          borderRadius: 12, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Skeleton width={44} height={44} borderRadius={10} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Skeleton height={15} width="55%" />
            <Skeleton height={12} width="35%" />
          </div>
          <Skeleton width={72} height={28} borderRadius={8} style={{ flexShrink: 0 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ cols = 3, cards = 6 }: { cols?: number; cards?: number }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 16,
    }}>
      {Array.from({ length: cards }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
