import { useState } from 'react'
import { Link } from 'react-router-dom'
import { C } from '../../lib/theme'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    if (supabase) {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nova-senha`,
      })
      if (err) { setError(err.message); setLoading(false); return }
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#E10600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 26, fontWeight: 900,
            color: '#fff',
          }}>T</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
            Recuperar senha
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
            Enviaremos um link para o seu e-mail
          </p>
        </div>

        <div style={{
          background: '#111111', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 16, padding: 32,
        }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
              <h2 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>
                E-mail enviado!
              </h2>
              <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                Verifique sua caixa de entrada em <strong style={{ color: C.text }}>{email}</strong> e siga as instruções para redefinir sua senha.
              </p>
              <Link to="/login" style={{
                display: 'block', padding: '12px', borderRadius: 10,
                background: 'rgba(225,6,0,0.1)', color: '#E10600',
                textDecoration: 'none', fontSize: 14, fontWeight: 600,
                border: `1px solid rgba(225,6,0,0.2)`,
              }}>
                Voltar para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Input
                label="Seu e-mail"
                placeholder="seu@email.com"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              {error && (
                <div style={{
                  background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.danger,
                }}>
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Enviar link de recuperação
              </Button>

              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                <Link to="/login" style={{ color: C.textMuted, fontSize: 13, textDecoration: 'none' }}>
                  ← Voltar para o login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
