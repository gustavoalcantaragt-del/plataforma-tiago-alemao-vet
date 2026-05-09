import { C } from '../../lib/theme'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = '📭', title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
      background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
      borderRadius: 16,
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>{icon}</div>
      <h3 style={{ color: C.text, fontWeight: 600, fontSize: 17, margin: '0 0 8px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 24px', maxWidth: 340, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
