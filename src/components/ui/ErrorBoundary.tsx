import { Component, type ReactNode, type ErrorInfo } from 'react'
import { C } from '../../lib/theme'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: C.bgCard, border: `1px solid ${C.borderSubtle}`,
            borderRadius: 16, padding: 40, maxWidth: 480, width: '100%',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ color: C.text, fontWeight: 700, fontSize: 22, margin: '0 0 8px' }}>
              Algo deu errado
            </h2>
            <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              Ocorreu um erro inesperado. Tente recarregar a página.
              Se o problema persistir, entre em contato com o suporte.
            </p>
            {this.state.message && (
              <p style={{
                background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
                borderRadius: 8, padding: '8px 12px', fontSize: 12,
                color: C.textDim, fontFamily: 'monospace', marginBottom: 24,
                wordBreak: 'break-word',
              }}>
                {this.state.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                background: C.red, color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px 28px', fontSize: 15,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
