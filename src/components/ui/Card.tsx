import { C, shadow, radius } from '../../lib/theme'
import { useState } from 'react'

interface CardProps {
  children: React.ReactNode
  glow?: boolean
  hover?: boolean
  padding?: number | string
  style?: React.CSSProperties
  onClick?: () => void
}

export function Card({ children, glow = false, hover = false, padding = 24, style, onClick }: CardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.bgCard,
        border: `1px solid ${hovered && hover ? C.borderRed : C.borderSubtle}`,
        borderRadius: radius.lg,
        padding,
        boxShadow: glow ? shadow.red : shadow.card,
        transition: 'all 0.2s ease',
        transform: hovered && hover ? 'translateY(-2px)' : 'none',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
