import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { C } from '../../lib/theme'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // O Supabase redireciona para /nova-senha#access_token=...
  // O cliente JS detecta o hash automaticamente e cria uma sessão temporária.
  useEffect(() => {
    if (!supabase) { setSessionReady(true); return }

    // Aguarda o evento PASSWORD_RECOVERY que o Supabase emite ao detectar o hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setSessionReady(true)
    })

    // Se já há sessão ativa (usuário logado clicou no link), libera direto
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    if (supabase) {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) { setError(err.message); setLoading(false); return }
    }

    setDone(true)
    setLoading(false)
    setTimeout(() => navigate('/dashboard'), 2500)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B0B0B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: '#E10600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 26, fontWeight: 900,
            color: '#fff',
          }}>T</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: '0 0 6px' }}>
            Nova senha
          </h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
            Escolha uma senha forte para sua conta
          </p>
        </div>

        <div style={{
          background: '#111111', border: `1px solid rgba(255,255,255,0.08)`,
          borderRadius: 16, padding: 32,
        }}>
          {done ? (
            /* ── Sucesso ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h2 style={{ color: C.text, fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>
                Senha alterada!
              </h2>
              <p style={{ color: C.textMuted, fontSize: 14, margin: '0 0 6px', lineHeight: 1.6 }}>
                Sua senha foi atualizada com sucesso.
              </p>
              <p style={{ color: C.textDim, fontSize: 13, margin: 0 }}>
                Redirecionando para o dashboard...
              </p>
            </div>
          ) : !sessionReady ? (
            /* ── Aguardando token ── */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: `3px solid #E10600`, borderTopColor: 'transparent',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: C.textMuted, fontSize: 14, margin: 0 }}>
                Verificando link de recuperação...
              </p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            /* ── Formulário ── */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a senha"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />

              {/* Indicador de força da senha */}
              {password.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map(i => {
                      const strength = Math.min(
                        Math.floor(password.length / 3) +
                        (password.match(/[A-Z]/) ? 1 : 0) +
                        (password.match(/[0-9]/) ? 1 : 0) +
                        (password.match(/[^a-zA-Z0-9]/) ? 1 : 0),
                        4
                      )
                      const colors = ['', C.danger, '#F59E0B', '#E10600', C.success]
                      return (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 2,
                          background: i <= strength ? colors[strength] : C.borderSubtle,
                          transition: 'background 0.3s',
                        }} />
                      )
                    })}
                  </div>
                  <span style={{ fontSize: 11, color: C.textDim }}>
                    {password.length < 6 ? 'Muito fraca' :
                     password.length < 8 ? 'Fraca' :
                     password.match(/[A-Z]/) && password.match(/[0-9]/) ? 'Forte' : 'Média'}
                  </span>
                </div>
              )}

              {error && (
                <div style={{
                  background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.danger,
                }}>
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                Salvar nova senha
              </Button>

              <div style={{ textAlign: 'center' }}>
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
