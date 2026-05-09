import { C } from '../../lib/theme'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, padding: 24,
    }} onClick={onCancel}>
      <div style={{
        background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
        borderRadius: 14, padding: 28, width: '100%', maxWidth: 400,
      }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: '0 0 10px' }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: C.textMuted, margin: '0 0 24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button variant="danger" size="sm" onClick={() => { onConfirm(); onCancel() }}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
